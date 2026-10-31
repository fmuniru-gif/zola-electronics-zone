#!/usr/bin/env python3
"""Owner-only local gallery uploader. No web backend or public upload route.
Run from a checked-out Zola website repository; use the file dialog to select media.
"""
import hashlib, json, os, shutil, sys
from pathlib import Path
from tkinter import Tk, filedialog, simpledialog, messagebox
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
FOLDER=ROOT/'assets'/'gallery'
MANIFEST=FOLDER/'manifest.json'
IMAGES={'.jpg','.jpeg','.png','.webp'}
VIDEOS={'.mp4','.webm'}
MAX_VIDEO=85*1024*1024

def add_media(paths, capturer):
    data=json.loads(MANIFEST.read_text('utf-8'))
    assert data.get('version')==1 and isinstance(data.get('items'),list)
    added=[]
    for path in paths:
        p=Path(path)
        ext=p.suffix.lower()
        if ext not in IMAGES|VIDEOS:
            raise ValueError('Unsupported media: '+p.name)
        if ext in VIDEOS and p.stat().st_size>MAX_VIDEO:
            raise ValueError('Video too large (85 MB limit): '+p.name)
        caption=capturer(p.name)
        if caption is None: continue
        caption=caption.strip()[:140] or 'At Zola Electronics Zone'
        digest=hashlib.sha256(p.read_bytes()).hexdigest()[:14]
        if ext in IMAGES:
            target=FOLDER/(digest+'.webp')
            if not target.exists():
                with Image.open(p) as im:
                    im=ImageOps.exif_transpose(im)
                    im.thumbnail((1800,1800),Image.Resampling.LANCZOS)
                    im.convert('RGB').save(target,'WEBP',quality=83,method=6)
            kind='photo'
        else:
            header=p.open('rb').read(16)
            if ext=='.mp4' and b'ftyp' not in header[:16]:raise ValueError('Not a valid MP4 container: '+p.name)
            if ext=='.webm' and header[:4]!=b'\x1aE\xdf\xa3':raise ValueError('Not a valid WebM container: '+p.name)
            target=FOLDER/(digest+ext)
            if not target.exists():shutil.copyfile(p,target)
            kind='video'
        src='assets/gallery/'+target.name
        if any(item.get('src')==src for item in data['items']):continue
        data['items'].append({'type':kind,'src':src,'caption':caption,'alt':caption} if kind=='photo' else {'type':kind,'src':src,'caption':caption})
        added.append(src)
    if added:
        MANIFEST.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n','utf-8')
    return added

if __name__=='__main__':
    root=Tk();root.withdraw();root.attributes('-topmost',True)
    try:
        paths=filedialog.askopenfilenames(title='Select Zola gallery photos or videos',filetypes=[('Images and videos','*.jpg *.jpeg *.png *.webp *.mp4 *.webm')])
        if not paths:
            print('No files selected.');sys.exit(0)
        new=add_media(paths,lambda name:simpledialog.askstring('Gallery caption','Caption for '+name+' (optional)',parent=root))
        msg=f'Added {len(new)} item(s) to your LOCAL gallery. Review and commit the files before publication.\n\n'+'\n'.join(new)
        print(msg);messagebox.showinfo('Zola gallery',msg,parent=root)
    except Exception as exc:
        messagebox.showerror('Gallery upload failed',str(exc),parent=root)
        raise
    finally:root.destroy()
