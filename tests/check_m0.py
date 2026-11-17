"""M0 contract checks only. Run: python tests/check_m0.py (requires jsonschema 4.x).

Custom date-time assertion avoids an optional RFC3339 dependency being silently
absent from Python jsonschema's default FormatChecker registry.
"""
import json, copy, re
from datetime import datetime
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
root=Path(__file__).resolve().parents[1]
s=json.loads((root/'schemas/scene-v1.schema.json').read_text()); e=json.loads((root/'examples/falling-ball.scene.json').read_text())
Draft202012Validator.check_schema(s)
formats=FormatChecker()
@formats.checks('date-time', raises=(ValueError, TypeError))
def check_datetime(value):
    if not isinstance(value,str): return True
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})',value): return False
    return datetime.fromisoformat(value.replace('Z','+00:00')).tzinfo is not None
v=Draft202012Validator(s,format_checker=formats)
checks=[]
def check(name,scene,valid):
    errs=list(v.iter_errors(scene))
    assert (not errs)==valid, (name,[x.message for x in errs])
    checks.append(name)
check('saved falling-ball example',e,True)
x=copy.deepcopy(e);x['identity']={'state':'draft'};check('draft identity',x,True)
for shape in [{'type':'rectangle','width':2,'height':1},{'type':'polygon','vertices':[{'x':-1,'y':-1},{'x':1,'y':-1},{'x':0,'y':2}]}]:
    x=copy.deepcopy(e);x['bodies'][0]['shape']=shape;check('shape '+shape['type'],x,True)
x=copy.deepcopy(e); x['bodies'][0]['massModel']={'mode':'density','arealDensity':100};check('areal density',x,True)
a={'type':'body','bodyId':e['bodies'][0]['id'],'localPoint':{'x':0,'y':0}}
b={'type':'world','point':{'x':0,'y':4}}
for kind,fields in [('hinge',{}),('rod',{'length':1}),('rope',{'maxLength':1}),('spring',{'restLength':1,'springConstant':10,'dampingCoefficient':0.2})]:
    x=copy.deepcopy(e);x['constraints']=[{'id':'e6172127-180d-457b-b8d3-cdff1937ea1c','name':'Test','type':kind,'anchorA':a,'anchorB':b,'collideConnected':False,**fields}];check('constraint '+kind,x,True)
x=copy.deepcopy(e);x['forces']=[{'id':'e6172127-180d-457b-b8d3-cdff1937ea1c','type':'constantForce','bodyId':e['bodies'][0]['id'],'vector':{'x':1,'y':0},'localPoint':{'x':0,'y':0}}];check('constant force',x,True)
for target in [{'type':'body','bodyId':e['bodies'][0]['id'],'parameter':'mass'},{'type':'world','parameter':'gravityY'}]:
    x=copy.deepcopy(e);x['studentPolicy']['controls']=[{'id':'e6172127-180d-457b-b8d3-cdff1937ea1c','label':'Test','min':0.1,'max':10,'step':0.1,'target':target}];check('control '+target['type'],x,True)
x=copy.deepcopy(e);x['measurements']=[{'id':'e6172127-180d-457b-b8d3-cdff1937ea1c','bodyId':e['bodies'][0]['id'],'quantity':'velocityY','display':'both','sampleEveryTicks':1,'maxSamples':1000}];check('measurement',x,True)
for label,change in [
('future version',lambda x:x.update(schemaVersion=2)),
('unknown root key',lambda x:x.update(script='alert(1)')),
('bad UUID',lambda x:x['bodies'][0].update(id='invalid')),
('bad timestamp',lambda x:x['identity'].update(savedAt='yesterday')),
('negative mass',lambda x:x['bodies'][0]['massModel'].update(mass=-1)),
('zero radius',lambda x:x['bodies'][0]['shape'].update(radius=0)),
('irrelevant shape key',lambda x:x['bodies'][0]['shape'].update(width=2)),
('missing field',lambda x:x.pop('world')),
('unbounded timestep',lambda x:x['simulation'].update(timestepSeconds=1)),
('unknown engine',lambda x:x['simulation']['engine'].update(name='custom')),
('body cap',lambda x:x.update(bodies=x['bodies']*51)),
('unknown student target',lambda x:x['studentPolicy'].update(controls=[{'id':'e6172127-180d-457b-b8d3-cdff1937ea1c','label':'Test','min':1,'max':2,'step':1,'target':{'type':'world','parameter':'engine'}}]))]:
    x=copy.deepcopy(e);change(x);check(label,x,False)
# Documentation relative links and named deliverables.
for filename in ['SPEC.md','ARCHITECTURE.md','ROADMAP.md','AGENTS.md','TEST_PLAN.md','SCENE_FORMAT.md','ENGINE_FEASIBILITY.md']:
    p=root/filename; assert p.stat().st_size>0
    for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
        if not re.match(r'https?://',link): assert (p.parent/link.split('#')[0]).exists(), (filename,link)
print('Draft 2020-12 schema self-check passed')
print(str(len(checks))+' positive/negative structural fixtures passed')
print('7 required/supporting documents and relative links checked')
print('M0 structural checks only; this script does not evaluate PoC physics, semantics or browser behavior')
