# Original synthesized soundtrack (royalty-free) — 28s, 120 BPM
import numpy as np, wave, sys
import json, os
CFG=json.loads(os.environ.get('MUSIC_CFG','{}'))
SR=48000; T=CFG.get('T',28.0); DROP=CFG.get('drop',4.4); WH=CFG.get('whoosh',[8.6,13.6,19.2,23.0]); N=int(SR*T); t=np.arange(N)/SR
out=np.zeros((N,2))
rng=np.random.default_rng(7)
def env(n,a,d): 
    e=np.ones(n); A=int(a*SR); e[:A]=np.linspace(0,1,A) if A>0 else 1
    return e*np.exp(-np.arange(n)/SR/d)
def add(sig,start,pan=0.0,g=1.0):
    i=int(start*SR); j=min(N,i+len(sig)); s=sig[:j-i]*g
    out[i:j,0]+=s*(1-pan)/1; out[i:j,1]+=s*(1+pan)/1
def note(f): return 440*2**((f-69)/12)
def lp(x,a): # one-pole lowpass
    y=np.zeros_like(x); acc=0.0
    aa=np.broadcast_to(a,x.shape)
    for k in range(len(x)): acc+= aa[k]*(x[k]-acc); y[k]=acc
    return y
# Chords (A minor -> F -> C -> G), 2s each
prog=[[57,60,64,69],[53,57,60,65],[48,55,60,64],[55,59,62,67]]
bass=[33,29,36,31]
beat=0.5
# Pad (whole piece)
for k in range(int(T/2)+1):
    ch=prog[k%4]; n=int(2.0*SR)+int(.6*SR); tt=np.arange(n)/SR
    sig=sum(np.sin(2*np.pi*note(m)*tt+0.3*np.sin(2*np.pi*0.3*tt))+0.3*np.sin(2*np.pi*note(m)*2.003*tt) for m in ch)/len(ch)
    e=np.minimum(1,tt/.4)*np.minimum(1,(n/SR-tt)/.6)
    add(sig*e,k*2.0,0,0.16)
# Ticking hat during intro, full drums after 4.4
def kick():
    n=int(.35*SR); tt=np.arange(n)/SR; f=50+90*np.exp(-tt*30)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*9)
def hat(d=.04):
    n=int(.12*SR); x=rng.standard_normal(n); x=x-np.concatenate([[0],x[:-1]])
    return x*np.exp(-np.arange(n)/SR/d)
def snare():
    n=int(.25*SR); tt=np.arange(n)/SR; x=rng.standard_normal(n)*np.exp(-tt*18)*.6+np.sin(2*np.pi*190*tt)*np.exp(-tt*25)*.5
    return x
K,Hh,S=kick(),hat(),snare()
for b in range(int(T/beat)):
    tb=b*beat
    if tb<DROP-0.4: add(hat(.02),tb+beat/2,.3,.10); continue
    if tb>=T-1.0: break
    add(K,tb,0,.9)
    add(Hh,tb+beat/2,.35,.16); add(hat(.015),tb+beat/4,-.35,.07); add(hat(.015),tb+3*beat/4,-.35,.07)
    if b%2==1: add(S,tb,0,.35)
# Bass + arpeggio pluck after drop
for k in range(0,int(T/2)+1):
    tk=k*2.0
    if tk<DROP-0.5: continue
    if tk>=T-1: break
    for s8 in range(8):
        n=int(.24*SR); tt=np.arange(n)/SR
        f=note(bass[k%4]+12); b=(np.sign(np.sin(2*np.pi*f*tt))*0.5+np.sin(2*np.pi*f*tt))*np.exp(-tt*7)
        add(b,tk+s8*.25,0,.17)
    ch=prog[k%4]
    for s16 in range(16):
        m=ch[[0,1,2,3,2,1,3,2][s16%8]]+12; n=int(.2*SR); tt=np.arange(n)/SR
        pl=(np.sin(2*np.pi*note(m)*tt)+.4*np.sin(2*np.pi*note(m)*2*tt))*np.exp(-tt*16)
        add(pl,tk+s16*.125,[-.4,.4][s16%2],.07)
# Riser into the drop (3.0 -> 4.4) and impact
n=int(1.4*SR); tt=np.arange(n)/SR; x=rng.standard_normal(n); x=lp(x,0.02+0.5*(tt/1.4)**2)
add(x*(tt/1.4)**2,DROP-1.4,0,.9)
n=int(2.5*SR); tt=np.arange(n)/SR
imp=np.sin(2*np.pi*np.cumsum(40+60*np.exp(-tt*8))/SR)*np.exp(-tt*2.5)+rng.standard_normal(n)*np.exp(-tt*6)*.25
add(imp,DROP,0,.8)
# Whooshes on scene changes
for w in WH:
    n=int(.7*SR); tt=np.arange(n)/SR; x=lp(rng.standard_normal(n),0.08); e=np.sin(np.pi*tt/.7)**2
    add(x*e,w,0,.55)
# Final hit at 27
n=int(1.0*SR); tt=np.arange(n)/SR
add((np.sin(2*np.pi*note(45)*tt)+np.sin(2*np.pi*note(57)*tt)*.5)*np.exp(-tt*2),T-1.0,0,.5)
# master: fade in/out, normalize, soft clip
fade=np.ones(N); fi=int(.3*SR); fade[:fi]=np.linspace(0,1,fi); fo=int(1.2*SR); fade[-fo:]=np.linspace(1,0,fo)
out*=fade[:,None]; out=np.tanh(out*1.3); out/=np.abs(out).max()/0.89
pcm=(out*32767).astype('<i2')
with wave.open(sys.argv[1],'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
