"""Reference fixtures only; no user images. Regenerate when changing synthetic presets."""
import cv2, numpy as np, json
from pathlib import Path
presets={}
r=np.zeros((7,7),np.uint8);r[1:6,1:6]=1;r[2:5,2:5]=0
p=np.zeros((7,7),np.uint8);p[2:5,2:5]=1
z=np.zeros((7,7),np.uint8);z[3,3]=1
d=np.zeros((7,7),np.uint8);d[2,2]=d[3,3]=1
for key,m in [('ring',r),('square',p),('single',z),('diagonal',d)]:
 cases={}
 for mode,retr in [('EXTERNAL',cv2.RETR_EXTERNAL),('TREE',cv2.RETR_TREE)]:
  for method,approx in [('NONE',cv2.CHAIN_APPROX_NONE),('SIMPLE',cv2.CHAIN_APPROX_SIMPLE)]:
   cs,h=cv2.findContours(m.copy(),retr,approx)
   cases[mode+'_'+method]={'paths':[c.reshape(-1,2).tolist() for c in cs],'hierarchy':h[0].tolist() if h is not None else [],'areas':[float(cv2.contourArea(c)) for c in cs]}
 presets[key]={'mask':m.tolist(),'cases':cases}
Path('lib/cv10-contours.json').write_text(json.dumps({'opencv':cv2.__version__,'presets':presets},indent=2)+'\n')
print('Saved 16 exact OpenCV contour fixtures.')
