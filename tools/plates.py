"""Generates assets/img/plates.svg — engraved line plates of the crest's four quarters.
Hatching is computed (clipped segments), so the sprite needs no <pattern>/<clipPath>
and themes through currentColor when used via <use>.  Run: python3 tools/plates.py"""
import math
R = lambda v: f"{v:.1f}"
def P(pts, close=False): return "M" + " L".join(f"{R(x)} {R(y)}" for x, y in pts) + (" Z" if close else "")
def ell(cx, cy, rx, ry, rot=0, a0=0, a1=360, n=96):
    out=[]; r=math.radians(rot)
    for i in range(n+1):
        t=math.radians(a0+(a1-a0)*i/n); x,y=rx*math.cos(t),ry*math.sin(t)
        out.append((cx+x*math.cos(r)-y*math.sin(r), cy+x*math.sin(r)+y*math.cos(r)))
    return out
def hatch_circle(cx, cy, r, ang, gap, cond=lambda x,y:True):
    """parallel lines at angle `ang` clipped to a circle, kept where cond(mid) is true"""
    segs=[]; a=math.radians(ang); dx,dy=math.cos(a),math.sin(a); nx,ny=-dy,dx
    k=-r
    while k<=r:
        h=math.sqrt(max(0,r*r-k*k)); px,py=cx+nx*k,cy+ny*k
        x1,y1,x2,y2=px-dx*h,py-dy*h,px+dx*h,py+dy*h
        # split segment into pieces satisfying cond
        steps=24; cur=None
        for i in range(steps+1):
            t=i/steps; x,y=x1+(x2-x1)*t,y1+(y2-y1)*t; ok=cond(x,y)
            if ok and cur is None: cur=(x,y)
            if (not ok or i==steps) and cur is not None:
                segs.append((cur,(x,y))); cur=None
        k+=gap
    return "".join(f"M{R(a[0])} {R(a[1])}L{R(b[0])} {R(b[1])}" for a,b in segs if math.dist(a,b)>2)

def path(d, w=1.4, o=1, extra=""): return f'<path d="{d}" fill="none" stroke="currentColor" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" opacity="{o}"{extra}/>'
def frame():
    # engraved double frame + corner marks, shared by every plate
    s=path("M24 24h352v352H24z",.9,.35)+path("M34 34h332v332H34z",.6,.25)
    for x,y,sx,sy in [(24,24,1,1),(376,24,-1,1),(24,376,1,-1),(376,376,-1,-1)]:
        s+=path(f"M{x+sx*10} {y+sy*10}l{sx*14} 0M{x+sx*10} {y+sy*10}l0 {sy*14}",1,.6)
    return s

plates={}
# ---------------- ATOM ----------------
s=frame()
for rot in (0,60,120):
    s+=path(P(ell(200,200,150,56,rot)),1.5,.9)
    s+=path(P(ell(200,200,158,62,rot,10,170,40)),.6,.35)
s+=path(P(ell(200,200,104,104),True),.7,.25)+path(P(ell(200,200,180,180)),.6,.18,' stroke-dasharray="2 7"')
nuc=[(200,200,22),(186,192,13),(213,191,12),(205,214,13),(189,212,12)]
for cx,cy,r in nuc:
    s+=path(P(ell(cx,cy,r,r),True),1.3,.95)+path(hatch_circle(cx,cy,r-1.5,35,3.2,lambda x,y,cx=cx,cy=cy:(x-cx)+(y-cy)>-2),.7,.7)
for rot,t in ((0,30),(60,200),(120,320)):
    ex,ey=ell(200,200,150,56,rot,t,t,1)[0]
    s+=path(P(ell(ex,ey,7,7),True),1.4,1)+path(hatch_circle(ex,ey,6,35,2.4),.6,.8)
plates['atom']=s
# ---------------- GLOBE ----------------
s=frame(); cx,cy,r=200,190,120
s+=path(P(ell(cx,cy,r,r),True),1.6,.95)
for k in range(1,6):  # meridians
    s+=path(P(ell(cx,cy,r*math.cos(math.radians(k*30)),r,0,-90,90,48)),.9,.6)+path(P(ell(cx,cy,r*math.cos(math.radians(k*30)),r,0,90,270,48)),.9,.6)
s+=path(f"M{cx} {cy-r}V{cy+r}",.9,.6)
for k in range(-3,4):  # parallels
    y=cy+k*r*.26; h=math.sqrt(max(0,r*r-(y-cy)**2)); s+=path(f"M{R(cx-h)} {R(y)}L{R(cx+h)} {R(y)}",.9 if k else 1.2,.6 if k else .8)
s+=path(hatch_circle(cx,cy,r-2,-35,4.2,lambda x,y:(x-cx)*.8+(y-cy)*.5>r*.42),.6,.55)  # terminator shading
s+=path(P(ell(cx,cy,r+18,r+18,0,-200,20,80)),2,.85)+path(P(ell(cx,cy,r+24,r+24,0,-200,20,80)),.8,.5)  # meridian ring
s+=path(f"M{cx} {cy+r+24}V{cy+r+52}M{cx-46} {cy+r+60}Q{cx} {cy+r+44} {cx+46} {cy+r+60}M{cx-58} {cy+r+66}h116",1.5,.9)
plates['globe']=s
# ---------------- OPEN BOOK ----------------
s=frame()
L=[(200,262),(160,248),(110,250),(58,262),(58,132),(110,120),(160,118),(200,134)]
Rr=[(x2,y) for x2,y in [(400-x,y) for x,y in L]]
def page(pts): return "M"+f"{R(pts[0][0])} {R(pts[0][1])} C{R(pts[1][0])} {R(pts[1][1])} {R(pts[2][0])} {R(pts[2][1])} {R(pts[3][0])} {R(pts[3][1])} L{R(pts[4][0])} {R(pts[4][1])} C{R(pts[5][0])} {R(pts[5][1])} {R(pts[6][0])} {R(pts[6][1])} {R(pts[7][0])} {R(pts[7][1])} Z"
s+=path(page(L),1.6,.95)+path(page(Rr),1.6,.95)
for i in range(3):  # stacked page edges
    o=6+i*5; s+=path(f"M{R(58)} {R(262+o)} C110 {R(250+o)} 160 {R(248+o)} 200 {R(262+o)} C240 {R(248+o)} 290 {R(250+o)} 342 {R(262+o)}",.8,.5-.12*i)
def bez(p0,p1,p2,p3,t): return tuple((1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d for a,b,c,d in zip(p0,p1,p2,p3))
topL=((58,132),(110,120),(160,118),(200,134)); botL=((58,262),(110,250),(160,248),(200,262))
for k in range(1,12):  # text lines follow the page curve exactly
    v=.12+k*.066
    if v>.86: break
    for side in (-1,1):
        u0,u1=(.1,.88) if not (k in (1,6)) else (.1,.62)
        pts=[]
        for i in range(17):
            u=u0+(u1-u0)*i/16; tp=bez(*topL,u); bt=bez(*botL,u); x=tp[0]; y=tp[1]+(bt[1]-tp[1])*v
            if side>0: x=400-x
            pts.append((x,y))
        s+=path(P(pts),.85,.5)
s+=path("M268 116v-34l12 9 12-9v34",1.3,.9)  # ribbon
s+=path(hatch_circle(200,200,190,90,3.4,lambda x,y:abs(x-200)<14 and 132<y<262),.6,.45)  # spine shadow
plates['book']=s
# ---------------- GRADUATION CAP ----------------
s=frame()
top=[(200,104),(338,160),(200,216),(62,160)]
s+=path(P(top,True),1.7,.95)
s+=path(P([(62,160),(62,166),(200,222),(338,166),(338,160)]),1.1,.7)
s+=path("M118 182v62c24 22 58 32 82 32s58-10 82-32v-62",1.6,.95)
s+=path("M118 244c24 18 58 26 82 26s58-8 82-26",.8,.45)
s+=path(hatch_circle(200,230,140,90,4,lambda x,y:118<x<282 and 188+((x-200)**2)/600<y<270-((x-200)**2)/300),.6,.5)
s+=path(P(ell(200,160,9,4.5),True),1.4,1)
s+=path("M200 160C250 166 300 176 316 190V262",1.3,.95)
for i in range(9):
    x=306+i*2.6; s+=path(f"M{R(x)} 262L{R(x+(i-4)*1.2)} {R(300+abs(i-4)*1.5)}",1,.85)
s+=path("M302 258h28v8h-28z",1.1,.9)
for k in range(1,7):  # board top hatching
    t=k/7; a=(200+(338-200)*t, 104+(160-104)*t); b=(62+(200-62)*t,160+(216-160)*t)
    s+=path(f"M{R(a[0])} {R(a[1])}L{R(b[0])} {R(b[1])}",.5,.35)
plates['cap']=s

out=['<svg xmlns="http://www.w3.org/2000/svg"><!-- The Classroom · engraved crest-quarter plates · generated by tools/plates.py --><defs>']
for k,v in plates.items(): out.append(f'<symbol id="p-{k}" viewBox="0 0 400 400">{v}</symbol>')
out.append('</defs></svg>')
open('assets/img/plates.svg','w').write("".join(out))
print({k:len(v) for k,v in plates.items()})
