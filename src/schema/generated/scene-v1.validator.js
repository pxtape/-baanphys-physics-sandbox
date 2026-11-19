/* Generated from schemas/scene-v1.schema.json. Do not edit; run npm run generate:scene. */
/* Inlined Unicode helper from Ajv (MIT):
The MIT License (MIT)

Copyright (c) 2015-2021 Evgeny Poberezkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


*/
import { fullFormats } from 'ajv-formats/dist/formats.js';
"use strict";
export const validate = validate20;
export default validate20;
const schema31 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://baanphys.example/schemas/scene-v1.schema.json","title":"BaanPhys Scene v1","description":"Planning contract; schema ID is a placeholder namespace, not a deployed service. SI, y-up, counterclockwise. Semantic and capability checks are mandatory.","type":"object","additionalProperties":false,"required":["schemaVersion","identity","title","units","world","simulation","bodies","constraints","forces","measurements","studentPolicy","view"],"properties":{"schemaVersion":{"const":1},"identity":{"$ref":"#/$defs/identity"},"title":{"type":"string","minLength":1,"maxLength":200},"description":{"type":"string","maxLength":4000},"units":{"const":"SI"},"world":{"type":"object","additionalProperties":false,"properties":{"gravity":{"$ref":"#/$defs/vector"}},"required":["gravity"]},"simulation":{"$ref":"#/$defs/simulation"},"bodies":{"type":"array","items":{"$ref":"#/$defs/body"},"minItems":0,"maxItems":100},"constraints":{"type":"array","items":{"$ref":"#/$defs/constraint"},"minItems":0,"maxItems":100},"forces":{"type":"array","items":{"$ref":"#/$defs/force"},"minItems":0,"maxItems":200},"measurements":{"type":"array","items":{"$ref":"#/$defs/measurement"},"minItems":0,"maxItems":20},"studentPolicy":{"type":"object","additionalProperties":false,"properties":{"controls":{"type":"array","items":{"$ref":"#/$defs/control"},"minItems":0,"maxItems":50}},"required":["controls"]},"view":{"type":"object","additionalProperties":false,"properties":{"cameraCenter":{"$ref":"#/$defs/vector"},"pixelsPerMeter":{"type":"number","minimum":1,"maximum":2000},"vectors":{"type":"object","additionalProperties":false,"properties":{"velocity":{"type":"boolean"},"acceleration":{"type":"boolean"},"appliedForce":{"type":"boolean"}},"required":["velocity","acceleration","appliedForce"]}},"required":["cameraCenter","pixelsPerMeter","vectors"]}},"$defs":{"id":{"type":"string","format":"uuid"},"vector":{"type":"object","additionalProperties":false,"properties":{"x":{"type":"number","minimum":-1000000,"maximum":1000000},"y":{"type":"number","minimum":-1000000,"maximum":1000000}},"required":["x","y"]},"name":{"type":"string","minLength":1,"maxLength":120},"identity":{"oneOf":[{"type":"object","additionalProperties":false,"properties":{"state":{"const":"draft"}},"required":["state"]},{"type":"object","additionalProperties":false,"properties":{"state":{"const":"saved"},"simulationId":{"$ref":"#/$defs/id"},"revisionId":{"$ref":"#/$defs/id"},"revisionNumber":{"type":"integer","minimum":1,"maximum":2147483647},"parentRevisionId":{"oneOf":[{"$ref":"#/$defs/id"},{"type":"null"}]},"createdAt":{"type":"string","format":"date-time"},"savedAt":{"type":"string","format":"date-time"}},"required":["state","simulationId","revisionId","revisionNumber","parentRevisionId","createdAt","savedAt"]}]},"shape":{"oneOf":[{"type":"object","additionalProperties":false,"properties":{"type":{"const":"circle"},"radius":{"type":"number","exclusiveMinimum":0,"maximum":10000}},"required":["type","radius"]},{"type":"object","additionalProperties":false,"properties":{"type":{"const":"rectangle"},"width":{"type":"number","exclusiveMinimum":0,"maximum":10000},"height":{"type":"number","exclusiveMinimum":0,"maximum":10000}},"required":["type","width","height"]},{"type":"object","additionalProperties":false,"properties":{"type":{"const":"polygon"},"vertices":{"type":"array","items":{"$ref":"#/$defs/vector"},"minItems":3,"maxItems":128}},"required":["type","vertices"]}]},"massModel":{"oneOf":[{"type":"object","additionalProperties":false,"properties":{"mode":{"const":"mass"},"mass":{"type":"number","minimum":0.000001,"maximum":1000000}},"required":["mode","mass"]},{"type":"object","additionalProperties":false,"properties":{"mode":{"const":"density"},"arealDensity":{"type":"number","minimum":0.000001,"maximum":1000000}},"required":["mode","arealDensity"]}]},"body":{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"name":{"$ref":"#/$defs/name"},"motionType":{"enum":["dynamic","static"]},"shape":{"$ref":"#/$defs/shape"},"position":{"$ref":"#/$defs/vector"},"angle":{"type":"number","minimum":-10000,"maximum":10000},"velocity":{"$ref":"#/$defs/vector"},"angularVelocity":{"type":"number","minimum":-10000,"maximum":10000},"massModel":{"$ref":"#/$defs/massModel"},"material":{"type":"object","additionalProperties":false,"properties":{"friction":{"type":"number","minimum":0,"maximum":2},"staticFriction":{"type":"number","minimum":0,"maximum":2},"restitution":{"type":"number","minimum":0,"maximum":1}},"required":["friction","staticFriction","restitution"]}},"required":["id","name","motionType","shape","position","angle","velocity","angularVelocity","massModel","material"]},"anchor":{"oneOf":[{"type":"object","additionalProperties":false,"properties":{"type":{"const":"world"},"point":{"$ref":"#/$defs/vector"}},"required":["type","point"]},{"type":"object","additionalProperties":false,"properties":{"type":{"const":"body"},"bodyId":{"$ref":"#/$defs/id"},"localPoint":{"$ref":"#/$defs/vector"}},"required":["type","bodyId","localPoint"]}]},"constraint":{"oneOf":[{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"name":{"$ref":"#/$defs/name"},"anchorA":{"$ref":"#/$defs/anchor"},"anchorB":{"$ref":"#/$defs/anchor"},"collideConnected":{"type":"boolean"},"type":{"const":"hinge"}},"required":["id","name","anchorA","anchorB","collideConnected","type"]},{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"name":{"$ref":"#/$defs/name"},"anchorA":{"$ref":"#/$defs/anchor"},"anchorB":{"$ref":"#/$defs/anchor"},"collideConnected":{"type":"boolean"},"type":{"const":"rod"},"length":{"type":"number","exclusiveMinimum":0,"maximum":10000}},"required":["id","name","anchorA","anchorB","collideConnected","type","length"]},{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"name":{"$ref":"#/$defs/name"},"anchorA":{"$ref":"#/$defs/anchor"},"anchorB":{"$ref":"#/$defs/anchor"},"collideConnected":{"type":"boolean"},"type":{"const":"rope"},"maxLength":{"type":"number","exclusiveMinimum":0,"maximum":10000}},"required":["id","name","anchorA","anchorB","collideConnected","type","maxLength"]},{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"name":{"$ref":"#/$defs/name"},"anchorA":{"$ref":"#/$defs/anchor"},"anchorB":{"$ref":"#/$defs/anchor"},"collideConnected":{"type":"boolean"},"type":{"const":"spring"},"restLength":{"type":"number","exclusiveMinimum":0,"maximum":10000},"springConstant":{"type":"number","exclusiveMinimum":0,"maximum":1000000},"dampingCoefficient":{"type":"number","minimum":0,"maximum":1000000}},"required":["id","name","anchorA","anchorB","collideConnected","type","restLength","springConstant","dampingCoefficient"]}]},"force":{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"type":{"const":"constantForce"},"bodyId":{"$ref":"#/$defs/id"},"vector":{"$ref":"#/$defs/vector"},"localPoint":{"$ref":"#/$defs/vector"}},"required":["id","type","bodyId","vector","localPoint"]},"measurement":{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"bodyId":{"$ref":"#/$defs/id"},"quantity":{"enum":["positionX","positionY","velocityX","velocityY","accelerationX","accelerationY","angularVelocity","kineticEnergy"]},"display":{"enum":["meter","graph","both"]},"sampleEveryTicks":{"type":"integer","minimum":1,"maximum":1200},"maxSamples":{"type":"integer","minimum":1,"maximum":72000}},"required":["id","bodyId","quantity","display","sampleEveryTicks","maxSamples"]},"control":{"oneOf":[{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"label":{"$ref":"#/$defs/name"},"min":{"type":"number","minimum":-1000000,"maximum":1000000},"max":{"type":"number","minimum":-1000000,"maximum":1000000},"step":{"type":"number","exclusiveMinimum":0,"maximum":1000000},"target":{"type":"object","additionalProperties":false,"properties":{"type":{"const":"body"},"bodyId":{"$ref":"#/$defs/id"},"parameter":{"enum":["mass","velocityX","velocityY"]}},"required":["type","bodyId","parameter"]}},"required":["id","label","min","max","step","target"]},{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"label":{"$ref":"#/$defs/name"},"min":{"type":"number","minimum":-1000000,"maximum":1000000},"max":{"type":"number","minimum":-1000000,"maximum":1000000},"step":{"type":"number","exclusiveMinimum":0,"maximum":1000000},"target":{"type":"object","additionalProperties":false,"properties":{"type":{"const":"world"},"parameter":{"enum":["gravityX","gravityY"]}},"required":["type","parameter"]}},"required":["id","label","min","max","step","target"]}]},"simulation":{"type":"object","additionalProperties":false,"properties":{"engine":{"type":"object","additionalProperties":false,"properties":{"name":{"enum":["matter-js","planck"]},"version":{"type":"string","pattern":"^\\d+\\.\\d+\\.\\d+$","maxLength":40},"adapterVersion":{"type":"string","pattern":"^\\d+\\.\\d+\\.\\d+$","maxLength":40},"profile":{"type":"string","pattern":"^[a-z0-9][a-z0-9.-]{0,79}$"}},"required":["name","version","adapterVersion","profile"]},"timestepSeconds":{"enum":[0.016666666666666666,0.008333333333333333,0.004166666666666667]},"substeps":{"type":"integer","minimum":1,"maximum":16},"solverIterations":{"type":"object","additionalProperties":false,"properties":{"position":{"type":"integer","minimum":1,"maximum":100},"velocity":{"type":"integer","minimum":1,"maximum":100},"constraint":{"type":"integer","minimum":1,"maximum":100}},"required":["position","velocity","constraint"]},"sleeping":{"const":false},"seed":{"type":"integer","minimum":0,"maximum":4294967295}},"required":["engine","timestepSeconds","substeps","solverIterations","sleeping","seed"]}}};
const schema36 = {"type":"object","additionalProperties":false,"properties":{"x":{"type":"number","minimum":-1000000,"maximum":1000000},"y":{"type":"number","minimum":-1000000,"maximum":1000000}},"required":["x","y"]};
const schema37 = {"type":"object","additionalProperties":false,"properties":{"engine":{"type":"object","additionalProperties":false,"properties":{"name":{"enum":["matter-js","planck"]},"version":{"type":"string","pattern":"^\\d+\\.\\d+\\.\\d+$","maxLength":40},"adapterVersion":{"type":"string","pattern":"^\\d+\\.\\d+\\.\\d+$","maxLength":40},"profile":{"type":"string","pattern":"^[a-z0-9][a-z0-9.-]{0,79}$"}},"required":["name","version","adapterVersion","profile"]},"timestepSeconds":{"enum":[0.016666666666666666,0.008333333333333333,0.004166666666666667]},"substeps":{"type":"integer","minimum":1,"maximum":16},"solverIterations":{"type":"object","additionalProperties":false,"properties":{"position":{"type":"integer","minimum":1,"maximum":100},"velocity":{"type":"integer","minimum":1,"maximum":100},"constraint":{"type":"integer","minimum":1,"maximum":100}},"required":["position","velocity","constraint"]},"sleeping":{"const":false},"seed":{"type":"integer","minimum":0,"maximum":4294967295}},"required":["engine","timestepSeconds","substeps","solverIterations","sleeping","seed"]};
const func0 = Object.prototype.hasOwnProperty;
const func92 = (function ucs2length(str) {
    const len = str.length;
    let length = 0;
    let pos = 0;
    let value;
    while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 0xd800 && value <= 0xdbff && pos < len) {
            // high surrogate, and there is a next character
            value = str.charCodeAt(pos);
            if ((value & 0xfc00) === 0xdc00)
                pos++; // low surrogate
        }
    }
    return length;
});
const schema32 = {"oneOf":[{"type":"object","additionalProperties":false,"properties":{"state":{"const":"draft"}},"required":["state"]},{"type":"object","additionalProperties":false,"properties":{"state":{"const":"saved"},"simulationId":{"$ref":"#/$defs/id"},"revisionId":{"$ref":"#/$defs/id"},"revisionNumber":{"type":"integer","minimum":1,"maximum":2147483647},"parentRevisionId":{"oneOf":[{"$ref":"#/$defs/id"},{"type":"null"}]},"createdAt":{"type":"string","format":"date-time"},"savedAt":{"type":"string","format":"date-time"}},"required":["state","simulationId","revisionId","revisionNumber","parentRevisionId","createdAt","savedAt"]}]};
const schema33 = {"type":"string","format":"uuid"};
const formats0 = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats6 = fullFormats["date-time"];

function validate21(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate21.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.state === undefined) || (!(func0.call(data, "state")))){
const err0 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "state"},message:"must have required property '"+"state"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 of Object.keys(data)){
if(!(key0 === "state")){
const err1 = {instancePath,schemaPath:"#/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.state !== undefined && func0.call(data, "state")){
if("draft" !== data.state){
const err2 = {instancePath:instancePath+"/state",schemaPath:"#/oneOf/0/properties/state/const",keyword:"const",params:{allowedValue: "draft"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
}
else {
const err3 = {instancePath,schemaPath:"#/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
var props0 = true;
}
const _errs5 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.state === undefined) || (!(func0.call(data, "state")))){
const err4 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "state"},message:"must have required property '"+"state"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((data.simulationId === undefined) || (!(func0.call(data, "simulationId")))){
const err5 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "simulationId"},message:"must have required property '"+"simulationId"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if((data.revisionId === undefined) || (!(func0.call(data, "revisionId")))){
const err6 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "revisionId"},message:"must have required property '"+"revisionId"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if((data.revisionNumber === undefined) || (!(func0.call(data, "revisionNumber")))){
const err7 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "revisionNumber"},message:"must have required property '"+"revisionNumber"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if((data.parentRevisionId === undefined) || (!(func0.call(data, "parentRevisionId")))){
const err8 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "parentRevisionId"},message:"must have required property '"+"parentRevisionId"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((data.createdAt === undefined) || (!(func0.call(data, "createdAt")))){
const err9 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "createdAt"},message:"must have required property '"+"createdAt"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if((data.savedAt === undefined) || (!(func0.call(data, "savedAt")))){
const err10 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "savedAt"},message:"must have required property '"+"savedAt"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
for(const key1 of Object.keys(data)){
if(!(((((((key1 === "state") || (key1 === "simulationId")) || (key1 === "revisionId")) || (key1 === "revisionNumber")) || (key1 === "parentRevisionId")) || (key1 === "createdAt")) || (key1 === "savedAt"))){
const err11 = {instancePath,schemaPath:"#/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.state !== undefined && func0.call(data, "state")){
if("saved" !== data.state){
const err12 = {instancePath:instancePath+"/state",schemaPath:"#/oneOf/1/properties/state/const",keyword:"const",params:{allowedValue: "saved"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.simulationId !== undefined && func0.call(data, "simulationId")){
let data2 = data.simulationId;
if(typeof data2 === "string"){
if(!(formats0.test(data2))){
const err13 = {instancePath:instancePath+"/simulationId",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/simulationId",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.revisionId !== undefined && func0.call(data, "revisionId")){
let data3 = data.revisionId;
if(typeof data3 === "string"){
if(!(formats0.test(data3))){
const err15 = {instancePath:instancePath+"/revisionId",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/revisionId",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.revisionNumber !== undefined && func0.call(data, "revisionNumber")){
let data4 = data.revisionNumber;
if(!(((typeof data4 == "number") && (!(data4 % 1) && !isNaN(data4))) && (isFinite(data4)))){
const err17 = {instancePath:instancePath+"/revisionNumber",schemaPath:"#/oneOf/1/properties/revisionNumber/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if((typeof data4 == "number") && (isFinite(data4))){
if(data4 > 2147483647 || isNaN(data4)){
const err18 = {instancePath:instancePath+"/revisionNumber",schemaPath:"#/oneOf/1/properties/revisionNumber/maximum",keyword:"maximum",params:{comparison: "<=", limit: 2147483647},message:"must be <= 2147483647"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(data4 < 1 || isNaN(data4)){
const err19 = {instancePath:instancePath+"/revisionNumber",schemaPath:"#/oneOf/1/properties/revisionNumber/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
}
if(data.parentRevisionId !== undefined && func0.call(data, "parentRevisionId")){
let data5 = data.parentRevisionId;
const _errs18 = errors;
let valid5 = false;
let passing1 = null;
const _errs19 = errors;
if(typeof data5 === "string"){
if(!(formats0.test(data5))){
const err20 = {instancePath:instancePath+"/parentRevisionId",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
else {
const err21 = {instancePath:instancePath+"/parentRevisionId",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
var _valid1 = _errs19 === errors;
if(_valid1){
valid5 = true;
passing1 = 0;
}
const _errs22 = errors;
if(data5 !== null){
const err22 = {instancePath:instancePath+"/parentRevisionId",schemaPath:"#/oneOf/1/properties/parentRevisionId/oneOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
var _valid1 = _errs22 === errors;
if(_valid1 && valid5){
valid5 = false;
passing1 = [passing1, 1];
}
else {
if(_valid1){
valid5 = true;
passing1 = 1;
}
}
if(!valid5){
const err23 = {instancePath:instancePath+"/parentRevisionId",schemaPath:"#/oneOf/1/properties/parentRevisionId/oneOf",keyword:"oneOf",params:{passingSchemas: passing1},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
else {
errors = _errs18;
if(vErrors !== null){
if(_errs18){
vErrors.length = _errs18;
}
else {
vErrors = null;
}
}
}
}
if(data.createdAt !== undefined && func0.call(data, "createdAt")){
let data6 = data.createdAt;
if(typeof data6 === "string"){
if(!(formats6.validate(data6))){
const err24 = {instancePath:instancePath+"/createdAt",schemaPath:"#/oneOf/1/properties/createdAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
else {
const err25 = {instancePath:instancePath+"/createdAt",schemaPath:"#/oneOf/1/properties/createdAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data.savedAt !== undefined && func0.call(data, "savedAt")){
let data7 = data.savedAt;
if(typeof data7 === "string"){
if(!(formats6.validate(data7))){
const err26 = {instancePath:instancePath+"/savedAt",schemaPath:"#/oneOf/1/properties/savedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/savedAt",schemaPath:"#/oneOf/1/properties/savedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
}
else {
const err28 = {instancePath,schemaPath:"#/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
var _valid0 = _errs5 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid0){
const err29 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate21.errors = vErrors;
evaluated0.props = props0;
return errors === 0;
}
validate21.evaluated = {"dynamicProps":true,"dynamicItems":false};

const schema38 = {"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"name":{"$ref":"#/$defs/name"},"motionType":{"enum":["dynamic","static"]},"shape":{"$ref":"#/$defs/shape"},"position":{"$ref":"#/$defs/vector"},"angle":{"type":"number","minimum":-10000,"maximum":10000},"velocity":{"$ref":"#/$defs/vector"},"angularVelocity":{"type":"number","minimum":-10000,"maximum":10000},"massModel":{"$ref":"#/$defs/massModel"},"material":{"type":"object","additionalProperties":false,"properties":{"friction":{"type":"number","minimum":0,"maximum":2},"staticFriction":{"type":"number","minimum":0,"maximum":2},"restitution":{"type":"number","minimum":0,"maximum":1}},"required":["friction","staticFriction","restitution"]}},"required":["id","name","motionType","shape","position","angle","velocity","angularVelocity","massModel","material"]};
const schema40 = {"type":"string","minLength":1,"maxLength":120};
const schema45 = {"oneOf":[{"type":"object","additionalProperties":false,"properties":{"mode":{"const":"mass"},"mass":{"type":"number","minimum":0.000001,"maximum":1000000}},"required":["mode","mass"]},{"type":"object","additionalProperties":false,"properties":{"mode":{"const":"density"},"arealDensity":{"type":"number","minimum":0.000001,"maximum":1000000}},"required":["mode","arealDensity"]}]};
const schema41 = {"oneOf":[{"type":"object","additionalProperties":false,"properties":{"type":{"const":"circle"},"radius":{"type":"number","exclusiveMinimum":0,"maximum":10000}},"required":["type","radius"]},{"type":"object","additionalProperties":false,"properties":{"type":{"const":"rectangle"},"width":{"type":"number","exclusiveMinimum":0,"maximum":10000},"height":{"type":"number","exclusiveMinimum":0,"maximum":10000}},"required":["type","width","height"]},{"type":"object","additionalProperties":false,"properties":{"type":{"const":"polygon"},"vertices":{"type":"array","items":{"$ref":"#/$defs/vector"},"minItems":3,"maxItems":128}},"required":["type","vertices"]}]};

function validate24(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate24.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.type === undefined) || (!(func0.call(data, "type")))){
const err0 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if((data.radius === undefined) || (!(func0.call(data, "radius")))){
const err1 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "radius"},message:"must have required property '"+"radius"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 of Object.keys(data)){
if(!((key0 === "type") || (key0 === "radius"))){
const err2 = {instancePath,schemaPath:"#/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.type !== undefined && func0.call(data, "type")){
if("circle" !== data.type){
const err3 = {instancePath:instancePath+"/type",schemaPath:"#/oneOf/0/properties/type/const",keyword:"const",params:{allowedValue: "circle"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.radius !== undefined && func0.call(data, "radius")){
let data1 = data.radius;
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 10000 || isNaN(data1)){
const err4 = {instancePath:instancePath+"/radius",schemaPath:"#/oneOf/0/properties/radius/maximum",keyword:"maximum",params:{comparison: "<=", limit: 10000},message:"must be <= 10000"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data1 <= 0 || isNaN(data1)){
const err5 = {instancePath:instancePath+"/radius",schemaPath:"#/oneOf/0/properties/radius/exclusiveMinimum",keyword:"exclusiveMinimum",params:{comparison: ">", limit: 0},message:"must be > 0"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/radius",schemaPath:"#/oneOf/0/properties/radius/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
}
else {
const err7 = {instancePath,schemaPath:"#/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
var props0 = true;
}
const _errs7 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.type === undefined) || (!(func0.call(data, "type")))){
const err8 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((data.width === undefined) || (!(func0.call(data, "width")))){
const err9 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "width"},message:"must have required property '"+"width"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if((data.height === undefined) || (!(func0.call(data, "height")))){
const err10 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "height"},message:"must have required property '"+"height"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
for(const key1 of Object.keys(data)){
if(!(((key1 === "type") || (key1 === "width")) || (key1 === "height"))){
const err11 = {instancePath,schemaPath:"#/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.type !== undefined && func0.call(data, "type")){
if("rectangle" !== data.type){
const err12 = {instancePath:instancePath+"/type",schemaPath:"#/oneOf/1/properties/type/const",keyword:"const",params:{allowedValue: "rectangle"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.width !== undefined && func0.call(data, "width")){
let data3 = data.width;
if((typeof data3 == "number") && (isFinite(data3))){
if(data3 > 10000 || isNaN(data3)){
const err13 = {instancePath:instancePath+"/width",schemaPath:"#/oneOf/1/properties/width/maximum",keyword:"maximum",params:{comparison: "<=", limit: 10000},message:"must be <= 10000"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(data3 <= 0 || isNaN(data3)){
const err14 = {instancePath:instancePath+"/width",schemaPath:"#/oneOf/1/properties/width/exclusiveMinimum",keyword:"exclusiveMinimum",params:{comparison: ">", limit: 0},message:"must be > 0"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/width",schemaPath:"#/oneOf/1/properties/width/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.height !== undefined && func0.call(data, "height")){
let data4 = data.height;
if((typeof data4 == "number") && (isFinite(data4))){
if(data4 > 10000 || isNaN(data4)){
const err16 = {instancePath:instancePath+"/height",schemaPath:"#/oneOf/1/properties/height/maximum",keyword:"maximum",params:{comparison: "<=", limit: 10000},message:"must be <= 10000"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if(data4 <= 0 || isNaN(data4)){
const err17 = {instancePath:instancePath+"/height",schemaPath:"#/oneOf/1/properties/height/exclusiveMinimum",keyword:"exclusiveMinimum",params:{comparison: ">", limit: 0},message:"must be > 0"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
else {
const err18 = {instancePath:instancePath+"/height",schemaPath:"#/oneOf/1/properties/height/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
}
else {
const err19 = {instancePath,schemaPath:"#/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
var _valid0 = _errs7 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
const _errs15 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.type === undefined) || (!(func0.call(data, "type")))){
const err20 = {instancePath,schemaPath:"#/oneOf/2/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
if((data.vertices === undefined) || (!(func0.call(data, "vertices")))){
const err21 = {instancePath,schemaPath:"#/oneOf/2/required",keyword:"required",params:{missingProperty: "vertices"},message:"must have required property '"+"vertices"+"'"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
for(const key2 of Object.keys(data)){
if(!((key2 === "type") || (key2 === "vertices"))){
const err22 = {instancePath,schemaPath:"#/oneOf/2/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data.type !== undefined && func0.call(data, "type")){
if("polygon" !== data.type){
const err23 = {instancePath:instancePath+"/type",schemaPath:"#/oneOf/2/properties/type/const",keyword:"const",params:{allowedValue: "polygon"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data.vertices !== undefined && func0.call(data, "vertices")){
let data6 = data.vertices;
if(Array.isArray(data6)){
if(data6.length > 128){
const err24 = {instancePath:instancePath+"/vertices",schemaPath:"#/oneOf/2/properties/vertices/maxItems",keyword:"maxItems",params:{limit: 128},message:"must NOT have more than 128 items"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
if(data6.length < 3){
const err25 = {instancePath:instancePath+"/vertices",schemaPath:"#/oneOf/2/properties/vertices/minItems",keyword:"minItems",params:{limit: 3},message:"must NOT have fewer than 3 items"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
const len0 = data6.length;
for(let i0=0; i0<len0; i0++){
let data7 = data6[i0];
if(data7 && typeof data7 == "object" && !Array.isArray(data7)){
if((data7.x === undefined) || (!(func0.call(data7, "x")))){
const err26 = {instancePath:instancePath+"/vertices/" + i0,schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "x"},message:"must have required property '"+"x"+"'"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
if((data7.y === undefined) || (!(func0.call(data7, "y")))){
const err27 = {instancePath:instancePath+"/vertices/" + i0,schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "y"},message:"must have required property '"+"y"+"'"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
for(const key3 of Object.keys(data7)){
if(!((key3 === "x") || (key3 === "y"))){
const err28 = {instancePath:instancePath+"/vertices/" + i0,schemaPath:"#/$defs/vector/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data7.x !== undefined && func0.call(data7, "x")){
let data8 = data7.x;
if((typeof data8 == "number") && (isFinite(data8))){
if(data8 > 1000000 || isNaN(data8)){
const err29 = {instancePath:instancePath+"/vertices/" + i0+"/x",schemaPath:"#/$defs/vector/properties/x/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
if(data8 < -1000000 || isNaN(data8)){
const err30 = {instancePath:instancePath+"/vertices/" + i0+"/x",schemaPath:"#/$defs/vector/properties/x/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
else {
const err31 = {instancePath:instancePath+"/vertices/" + i0+"/x",schemaPath:"#/$defs/vector/properties/x/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
if(data7.y !== undefined && func0.call(data7, "y")){
let data9 = data7.y;
if((typeof data9 == "number") && (isFinite(data9))){
if(data9 > 1000000 || isNaN(data9)){
const err32 = {instancePath:instancePath+"/vertices/" + i0+"/y",schemaPath:"#/$defs/vector/properties/y/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if(data9 < -1000000 || isNaN(data9)){
const err33 = {instancePath:instancePath+"/vertices/" + i0+"/y",schemaPath:"#/$defs/vector/properties/y/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
else {
const err34 = {instancePath:instancePath+"/vertices/" + i0+"/y",schemaPath:"#/$defs/vector/properties/y/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
}
else {
const err35 = {instancePath:instancePath+"/vertices/" + i0,schemaPath:"#/$defs/vector/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
}
else {
const err36 = {instancePath:instancePath+"/vertices",schemaPath:"#/oneOf/2/properties/vertices/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
}
else {
const err37 = {instancePath,schemaPath:"#/oneOf/2/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
var _valid0 = _errs15 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 2];
}
else {
if(_valid0){
valid0 = true;
passing0 = 2;
if(props0 !== true){
props0 = true;
}
}
}
}
if(!valid0){
const err38 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate24.errors = vErrors;
evaluated0.props = props0;
return errors === 0;
}
validate24.evaluated = {"dynamicProps":true,"dynamicItems":false};


function validate23(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate23.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.id === undefined) || (!(func0.call(data, "id")))){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if((data.name === undefined) || (!(func0.call(data, "name")))){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if((data.motionType === undefined) || (!(func0.call(data, "motionType")))){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "motionType"},message:"must have required property '"+"motionType"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if((data.shape === undefined) || (!(func0.call(data, "shape")))){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "shape"},message:"must have required property '"+"shape"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if((data.position === undefined) || (!(func0.call(data, "position")))){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "position"},message:"must have required property '"+"position"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((data.angle === undefined) || (!(func0.call(data, "angle")))){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "angle"},message:"must have required property '"+"angle"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if((data.velocity === undefined) || (!(func0.call(data, "velocity")))){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "velocity"},message:"must have required property '"+"velocity"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if((data.angularVelocity === undefined) || (!(func0.call(data, "angularVelocity")))){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "angularVelocity"},message:"must have required property '"+"angularVelocity"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if((data.massModel === undefined) || (!(func0.call(data, "massModel")))){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "massModel"},message:"must have required property '"+"massModel"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((data.material === undefined) || (!(func0.call(data, "material")))){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "material"},message:"must have required property '"+"material"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
for(const key0 of Object.keys(data)){
if(!(func0.call(schema38.properties, key0))){
const err10 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.id !== undefined && func0.call(data, "id")){
let data0 = data.id;
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
const err11 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.name !== undefined && func0.call(data, "name")){
let data1 = data.name;
if(typeof data1 === "string"){
if(func92(data1) > 120){
const err13 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/maxLength",keyword:"maxLength",params:{limit: 120},message:"must NOT have more than 120 characters"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(func92(data1) < 1){
const err14 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.motionType !== undefined && func0.call(data, "motionType")){
let data2 = data.motionType;
if(!((data2 === "dynamic") || (data2 === "static"))){
const err16 = {instancePath:instancePath+"/motionType",schemaPath:"#/properties/motionType/enum",keyword:"enum",params:{allowedValues: schema38.properties.motionType.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.shape !== undefined && func0.call(data, "shape")){
if(!(validate24(data.shape, {instancePath:instancePath+"/shape",parentData:data,parentDataProperty:"shape",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
errors = vErrors.length;
}
}
if(data.position !== undefined && func0.call(data, "position")){
let data4 = data.position;
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
if((data4.x === undefined) || (!(func0.call(data4, "x")))){
const err17 = {instancePath:instancePath+"/position",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "x"},message:"must have required property '"+"x"+"'"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if((data4.y === undefined) || (!(func0.call(data4, "y")))){
const err18 = {instancePath:instancePath+"/position",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "y"},message:"must have required property '"+"y"+"'"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
for(const key1 of Object.keys(data4)){
if(!((key1 === "x") || (key1 === "y"))){
const err19 = {instancePath:instancePath+"/position",schemaPath:"#/$defs/vector/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data4.x !== undefined && func0.call(data4, "x")){
let data5 = data4.x;
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 > 1000000 || isNaN(data5)){
const err20 = {instancePath:instancePath+"/position/x",schemaPath:"#/$defs/vector/properties/x/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
if(data5 < -1000000 || isNaN(data5)){
const err21 = {instancePath:instancePath+"/position/x",schemaPath:"#/$defs/vector/properties/x/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
else {
const err22 = {instancePath:instancePath+"/position/x",schemaPath:"#/$defs/vector/properties/x/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data4.y !== undefined && func0.call(data4, "y")){
let data6 = data4.y;
if((typeof data6 == "number") && (isFinite(data6))){
if(data6 > 1000000 || isNaN(data6)){
const err23 = {instancePath:instancePath+"/position/y",schemaPath:"#/$defs/vector/properties/y/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
if(data6 < -1000000 || isNaN(data6)){
const err24 = {instancePath:instancePath+"/position/y",schemaPath:"#/$defs/vector/properties/y/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
else {
const err25 = {instancePath:instancePath+"/position/y",schemaPath:"#/$defs/vector/properties/y/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
}
else {
const err26 = {instancePath:instancePath+"/position",schemaPath:"#/$defs/vector/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
if(data.angle !== undefined && func0.call(data, "angle")){
let data7 = data.angle;
if((typeof data7 == "number") && (isFinite(data7))){
if(data7 > 10000 || isNaN(data7)){
const err27 = {instancePath:instancePath+"/angle",schemaPath:"#/properties/angle/maximum",keyword:"maximum",params:{comparison: "<=", limit: 10000},message:"must be <= 10000"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
if(data7 < -10000 || isNaN(data7)){
const err28 = {instancePath:instancePath+"/angle",schemaPath:"#/properties/angle/minimum",keyword:"minimum",params:{comparison: ">=", limit: -10000},message:"must be >= -10000"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/angle",schemaPath:"#/properties/angle/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
if(data.velocity !== undefined && func0.call(data, "velocity")){
let data8 = data.velocity;
if(data8 && typeof data8 == "object" && !Array.isArray(data8)){
if((data8.x === undefined) || (!(func0.call(data8, "x")))){
const err30 = {instancePath:instancePath+"/velocity",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "x"},message:"must have required property '"+"x"+"'"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
if((data8.y === undefined) || (!(func0.call(data8, "y")))){
const err31 = {instancePath:instancePath+"/velocity",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "y"},message:"must have required property '"+"y"+"'"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
for(const key2 of Object.keys(data8)){
if(!((key2 === "x") || (key2 === "y"))){
const err32 = {instancePath:instancePath+"/velocity",schemaPath:"#/$defs/vector/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
if(data8.x !== undefined && func0.call(data8, "x")){
let data9 = data8.x;
if((typeof data9 == "number") && (isFinite(data9))){
if(data9 > 1000000 || isNaN(data9)){
const err33 = {instancePath:instancePath+"/velocity/x",schemaPath:"#/$defs/vector/properties/x/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
if(data9 < -1000000 || isNaN(data9)){
const err34 = {instancePath:instancePath+"/velocity/x",schemaPath:"#/$defs/vector/properties/x/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
else {
const err35 = {instancePath:instancePath+"/velocity/x",schemaPath:"#/$defs/vector/properties/x/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
if(data8.y !== undefined && func0.call(data8, "y")){
let data10 = data8.y;
if((typeof data10 == "number") && (isFinite(data10))){
if(data10 > 1000000 || isNaN(data10)){
const err36 = {instancePath:instancePath+"/velocity/y",schemaPath:"#/$defs/vector/properties/y/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
if(data10 < -1000000 || isNaN(data10)){
const err37 = {instancePath:instancePath+"/velocity/y",schemaPath:"#/$defs/vector/properties/y/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
else {
const err38 = {instancePath:instancePath+"/velocity/y",schemaPath:"#/$defs/vector/properties/y/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
}
else {
const err39 = {instancePath:instancePath+"/velocity",schemaPath:"#/$defs/vector/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
if(data.angularVelocity !== undefined && func0.call(data, "angularVelocity")){
let data11 = data.angularVelocity;
if((typeof data11 == "number") && (isFinite(data11))){
if(data11 > 10000 || isNaN(data11)){
const err40 = {instancePath:instancePath+"/angularVelocity",schemaPath:"#/properties/angularVelocity/maximum",keyword:"maximum",params:{comparison: "<=", limit: 10000},message:"must be <= 10000"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
if(data11 < -10000 || isNaN(data11)){
const err41 = {instancePath:instancePath+"/angularVelocity",schemaPath:"#/properties/angularVelocity/minimum",keyword:"minimum",params:{comparison: ">=", limit: -10000},message:"must be >= -10000"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
else {
const err42 = {instancePath:instancePath+"/angularVelocity",schemaPath:"#/properties/angularVelocity/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
if(data.massModel !== undefined && func0.call(data, "massModel")){
let data12 = data.massModel;
const _errs32 = errors;
let valid8 = false;
let passing0 = null;
const _errs33 = errors;
if(data12 && typeof data12 == "object" && !Array.isArray(data12)){
if((data12.mode === undefined) || (!(func0.call(data12, "mode")))){
const err43 = {instancePath:instancePath+"/massModel",schemaPath:"#/$defs/massModel/oneOf/0/required",keyword:"required",params:{missingProperty: "mode"},message:"must have required property '"+"mode"+"'"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
if((data12.mass === undefined) || (!(func0.call(data12, "mass")))){
const err44 = {instancePath:instancePath+"/massModel",schemaPath:"#/$defs/massModel/oneOf/0/required",keyword:"required",params:{missingProperty: "mass"},message:"must have required property '"+"mass"+"'"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
for(const key3 of Object.keys(data12)){
if(!((key3 === "mode") || (key3 === "mass"))){
const err45 = {instancePath:instancePath+"/massModel",schemaPath:"#/$defs/massModel/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
if(data12.mode !== undefined && func0.call(data12, "mode")){
if("mass" !== data12.mode){
const err46 = {instancePath:instancePath+"/massModel/mode",schemaPath:"#/$defs/massModel/oneOf/0/properties/mode/const",keyword:"const",params:{allowedValue: "mass"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
if(data12.mass !== undefined && func0.call(data12, "mass")){
let data14 = data12.mass;
if((typeof data14 == "number") && (isFinite(data14))){
if(data14 > 1000000 || isNaN(data14)){
const err47 = {instancePath:instancePath+"/massModel/mass",schemaPath:"#/$defs/massModel/oneOf/0/properties/mass/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
if(data14 < 0.000001 || isNaN(data14)){
const err48 = {instancePath:instancePath+"/massModel/mass",schemaPath:"#/$defs/massModel/oneOf/0/properties/mass/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0.000001},message:"must be >= 0.000001"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
else {
const err49 = {instancePath:instancePath+"/massModel/mass",schemaPath:"#/$defs/massModel/oneOf/0/properties/mass/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
}
}
else {
const err50 = {instancePath:instancePath+"/massModel",schemaPath:"#/$defs/massModel/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
var _valid0 = _errs33 === errors;
if(_valid0){
valid8 = true;
passing0 = 0;
var props1 = true;
}
const _errs39 = errors;
if(data12 && typeof data12 == "object" && !Array.isArray(data12)){
if((data12.mode === undefined) || (!(func0.call(data12, "mode")))){
const err51 = {instancePath:instancePath+"/massModel",schemaPath:"#/$defs/massModel/oneOf/1/required",keyword:"required",params:{missingProperty: "mode"},message:"must have required property '"+"mode"+"'"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
if((data12.arealDensity === undefined) || (!(func0.call(data12, "arealDensity")))){
const err52 = {instancePath:instancePath+"/massModel",schemaPath:"#/$defs/massModel/oneOf/1/required",keyword:"required",params:{missingProperty: "arealDensity"},message:"must have required property '"+"arealDensity"+"'"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
for(const key4 of Object.keys(data12)){
if(!((key4 === "mode") || (key4 === "arealDensity"))){
const err53 = {instancePath:instancePath+"/massModel",schemaPath:"#/$defs/massModel/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
}
if(data12.mode !== undefined && func0.call(data12, "mode")){
if("density" !== data12.mode){
const err54 = {instancePath:instancePath+"/massModel/mode",schemaPath:"#/$defs/massModel/oneOf/1/properties/mode/const",keyword:"const",params:{allowedValue: "density"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
if(data12.arealDensity !== undefined && func0.call(data12, "arealDensity")){
let data16 = data12.arealDensity;
if((typeof data16 == "number") && (isFinite(data16))){
if(data16 > 1000000 || isNaN(data16)){
const err55 = {instancePath:instancePath+"/massModel/arealDensity",schemaPath:"#/$defs/massModel/oneOf/1/properties/arealDensity/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
if(data16 < 0.000001 || isNaN(data16)){
const err56 = {instancePath:instancePath+"/massModel/arealDensity",schemaPath:"#/$defs/massModel/oneOf/1/properties/arealDensity/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0.000001},message:"must be >= 0.000001"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
else {
const err57 = {instancePath:instancePath+"/massModel/arealDensity",schemaPath:"#/$defs/massModel/oneOf/1/properties/arealDensity/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
}
else {
const err58 = {instancePath:instancePath+"/massModel",schemaPath:"#/$defs/massModel/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
var _valid0 = _errs39 === errors;
if(_valid0 && valid8){
valid8 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid8 = true;
passing0 = 1;
if(props1 !== true){
props1 = true;
}
}
}
if(!valid8){
const err59 = {instancePath:instancePath+"/massModel",schemaPath:"#/$defs/massModel/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
else {
errors = _errs32;
if(vErrors !== null){
if(_errs32){
vErrors.length = _errs32;
}
else {
vErrors = null;
}
}
}
}
if(data.material !== undefined && func0.call(data, "material")){
let data17 = data.material;
if(data17 && typeof data17 == "object" && !Array.isArray(data17)){
if((data17.friction === undefined) || (!(func0.call(data17, "friction")))){
const err60 = {instancePath:instancePath+"/material",schemaPath:"#/properties/material/required",keyword:"required",params:{missingProperty: "friction"},message:"must have required property '"+"friction"+"'"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
if((data17.staticFriction === undefined) || (!(func0.call(data17, "staticFriction")))){
const err61 = {instancePath:instancePath+"/material",schemaPath:"#/properties/material/required",keyword:"required",params:{missingProperty: "staticFriction"},message:"must have required property '"+"staticFriction"+"'"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
if((data17.restitution === undefined) || (!(func0.call(data17, "restitution")))){
const err62 = {instancePath:instancePath+"/material",schemaPath:"#/properties/material/required",keyword:"required",params:{missingProperty: "restitution"},message:"must have required property '"+"restitution"+"'"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
for(const key5 of Object.keys(data17)){
if(!(((key5 === "friction") || (key5 === "staticFriction")) || (key5 === "restitution"))){
const err63 = {instancePath:instancePath+"/material",schemaPath:"#/properties/material/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
}
if(data17.friction !== undefined && func0.call(data17, "friction")){
let data18 = data17.friction;
if((typeof data18 == "number") && (isFinite(data18))){
if(data18 > 2 || isNaN(data18)){
const err64 = {instancePath:instancePath+"/material/friction",schemaPath:"#/properties/material/properties/friction/maximum",keyword:"maximum",params:{comparison: "<=", limit: 2},message:"must be <= 2"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
if(data18 < 0 || isNaN(data18)){
const err65 = {instancePath:instancePath+"/material/friction",schemaPath:"#/properties/material/properties/friction/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
else {
const err66 = {instancePath:instancePath+"/material/friction",schemaPath:"#/properties/material/properties/friction/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
}
if(data17.staticFriction !== undefined && func0.call(data17, "staticFriction")){
let data19 = data17.staticFriction;
if((typeof data19 == "number") && (isFinite(data19))){
if(data19 > 2 || isNaN(data19)){
const err67 = {instancePath:instancePath+"/material/staticFriction",schemaPath:"#/properties/material/properties/staticFriction/maximum",keyword:"maximum",params:{comparison: "<=", limit: 2},message:"must be <= 2"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
if(data19 < 0 || isNaN(data19)){
const err68 = {instancePath:instancePath+"/material/staticFriction",schemaPath:"#/properties/material/properties/staticFriction/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
}
else {
const err69 = {instancePath:instancePath+"/material/staticFriction",schemaPath:"#/properties/material/properties/staticFriction/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
}
if(data17.restitution !== undefined && func0.call(data17, "restitution")){
let data20 = data17.restitution;
if((typeof data20 == "number") && (isFinite(data20))){
if(data20 > 1 || isNaN(data20)){
const err70 = {instancePath:instancePath+"/material/restitution",schemaPath:"#/properties/material/properties/restitution/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1},message:"must be <= 1"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
if(data20 < 0 || isNaN(data20)){
const err71 = {instancePath:instancePath+"/material/restitution",schemaPath:"#/properties/material/properties/restitution/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
else {
const err72 = {instancePath:instancePath+"/material/restitution",schemaPath:"#/properties/material/properties/restitution/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
}
}
else {
const err73 = {instancePath:instancePath+"/material",schemaPath:"#/properties/material/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
}
}
else {
const err74 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
validate23.errors = vErrors;
return errors === 0;
}
validate23.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema46 = {"oneOf":[{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"name":{"$ref":"#/$defs/name"},"anchorA":{"$ref":"#/$defs/anchor"},"anchorB":{"$ref":"#/$defs/anchor"},"collideConnected":{"type":"boolean"},"type":{"const":"hinge"}},"required":["id","name","anchorA","anchorB","collideConnected","type"]},{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"name":{"$ref":"#/$defs/name"},"anchorA":{"$ref":"#/$defs/anchor"},"anchorB":{"$ref":"#/$defs/anchor"},"collideConnected":{"type":"boolean"},"type":{"const":"rod"},"length":{"type":"number","exclusiveMinimum":0,"maximum":10000}},"required":["id","name","anchorA","anchorB","collideConnected","type","length"]},{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"name":{"$ref":"#/$defs/name"},"anchorA":{"$ref":"#/$defs/anchor"},"anchorB":{"$ref":"#/$defs/anchor"},"collideConnected":{"type":"boolean"},"type":{"const":"rope"},"maxLength":{"type":"number","exclusiveMinimum":0,"maximum":10000}},"required":["id","name","anchorA","anchorB","collideConnected","type","maxLength"]},{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"name":{"$ref":"#/$defs/name"},"anchorA":{"$ref":"#/$defs/anchor"},"anchorB":{"$ref":"#/$defs/anchor"},"collideConnected":{"type":"boolean"},"type":{"const":"spring"},"restLength":{"type":"number","exclusiveMinimum":0,"maximum":10000},"springConstant":{"type":"number","exclusiveMinimum":0,"maximum":1000000},"dampingCoefficient":{"type":"number","minimum":0,"maximum":1000000}},"required":["id","name","anchorA","anchorB","collideConnected","type","restLength","springConstant","dampingCoefficient"]}]};
const schema49 = {"oneOf":[{"type":"object","additionalProperties":false,"properties":{"type":{"const":"world"},"point":{"$ref":"#/$defs/vector"}},"required":["type","point"]},{"type":"object","additionalProperties":false,"properties":{"type":{"const":"body"},"bodyId":{"$ref":"#/$defs/id"},"localPoint":{"$ref":"#/$defs/vector"}},"required":["type","bodyId","localPoint"]}]};

function validate28(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate28.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.type === undefined) || (!(func0.call(data, "type")))){
const err0 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if((data.point === undefined) || (!(func0.call(data, "point")))){
const err1 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "point"},message:"must have required property '"+"point"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 of Object.keys(data)){
if(!((key0 === "type") || (key0 === "point"))){
const err2 = {instancePath,schemaPath:"#/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.type !== undefined && func0.call(data, "type")){
if("world" !== data.type){
const err3 = {instancePath:instancePath+"/type",schemaPath:"#/oneOf/0/properties/type/const",keyword:"const",params:{allowedValue: "world"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.point !== undefined && func0.call(data, "point")){
let data1 = data.point;
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
if((data1.x === undefined) || (!(func0.call(data1, "x")))){
const err4 = {instancePath:instancePath+"/point",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "x"},message:"must have required property '"+"x"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((data1.y === undefined) || (!(func0.call(data1, "y")))){
const err5 = {instancePath:instancePath+"/point",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "y"},message:"must have required property '"+"y"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
for(const key1 of Object.keys(data1)){
if(!((key1 === "x") || (key1 === "y"))){
const err6 = {instancePath:instancePath+"/point",schemaPath:"#/$defs/vector/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data1.x !== undefined && func0.call(data1, "x")){
let data2 = data1.x;
if((typeof data2 == "number") && (isFinite(data2))){
if(data2 > 1000000 || isNaN(data2)){
const err7 = {instancePath:instancePath+"/point/x",schemaPath:"#/$defs/vector/properties/x/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data2 < -1000000 || isNaN(data2)){
const err8 = {instancePath:instancePath+"/point/x",schemaPath:"#/$defs/vector/properties/x/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
else {
const err9 = {instancePath:instancePath+"/point/x",schemaPath:"#/$defs/vector/properties/x/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data1.y !== undefined && func0.call(data1, "y")){
let data3 = data1.y;
if((typeof data3 == "number") && (isFinite(data3))){
if(data3 > 1000000 || isNaN(data3)){
const err10 = {instancePath:instancePath+"/point/y",schemaPath:"#/$defs/vector/properties/y/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data3 < -1000000 || isNaN(data3)){
const err11 = {instancePath:instancePath+"/point/y",schemaPath:"#/$defs/vector/properties/y/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/point/y",schemaPath:"#/$defs/vector/properties/y/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
else {
const err13 = {instancePath:instancePath+"/point",schemaPath:"#/$defs/vector/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath,schemaPath:"#/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
var props0 = true;
}
const _errs13 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.type === undefined) || (!(func0.call(data, "type")))){
const err15 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if((data.bodyId === undefined) || (!(func0.call(data, "bodyId")))){
const err16 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "bodyId"},message:"must have required property '"+"bodyId"+"'"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if((data.localPoint === undefined) || (!(func0.call(data, "localPoint")))){
const err17 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "localPoint"},message:"must have required property '"+"localPoint"+"'"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
for(const key2 of Object.keys(data)){
if(!(((key2 === "type") || (key2 === "bodyId")) || (key2 === "localPoint"))){
const err18 = {instancePath,schemaPath:"#/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data.type !== undefined && func0.call(data, "type")){
if("body" !== data.type){
const err19 = {instancePath:instancePath+"/type",schemaPath:"#/oneOf/1/properties/type/const",keyword:"const",params:{allowedValue: "body"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.bodyId !== undefined && func0.call(data, "bodyId")){
let data5 = data.bodyId;
if(typeof data5 === "string"){
if(!(formats0.test(data5))){
const err20 = {instancePath:instancePath+"/bodyId",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
else {
const err21 = {instancePath:instancePath+"/bodyId",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data.localPoint !== undefined && func0.call(data, "localPoint")){
let data6 = data.localPoint;
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
if((data6.x === undefined) || (!(func0.call(data6, "x")))){
const err22 = {instancePath:instancePath+"/localPoint",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "x"},message:"must have required property '"+"x"+"'"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if((data6.y === undefined) || (!(func0.call(data6, "y")))){
const err23 = {instancePath:instancePath+"/localPoint",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "y"},message:"must have required property '"+"y"+"'"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
for(const key3 of Object.keys(data6)){
if(!((key3 === "x") || (key3 === "y"))){
const err24 = {instancePath:instancePath+"/localPoint",schemaPath:"#/$defs/vector/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data6.x !== undefined && func0.call(data6, "x")){
let data7 = data6.x;
if((typeof data7 == "number") && (isFinite(data7))){
if(data7 > 1000000 || isNaN(data7)){
const err25 = {instancePath:instancePath+"/localPoint/x",schemaPath:"#/$defs/vector/properties/x/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if(data7 < -1000000 || isNaN(data7)){
const err26 = {instancePath:instancePath+"/localPoint/x",schemaPath:"#/$defs/vector/properties/x/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/localPoint/x",schemaPath:"#/$defs/vector/properties/x/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data6.y !== undefined && func0.call(data6, "y")){
let data8 = data6.y;
if((typeof data8 == "number") && (isFinite(data8))){
if(data8 > 1000000 || isNaN(data8)){
const err28 = {instancePath:instancePath+"/localPoint/y",schemaPath:"#/$defs/vector/properties/y/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
if(data8 < -1000000 || isNaN(data8)){
const err29 = {instancePath:instancePath+"/localPoint/y",schemaPath:"#/$defs/vector/properties/y/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
else {
const err30 = {instancePath:instancePath+"/localPoint/y",schemaPath:"#/$defs/vector/properties/y/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
}
else {
const err31 = {instancePath:instancePath+"/localPoint",schemaPath:"#/$defs/vector/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
}
else {
const err32 = {instancePath,schemaPath:"#/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
var _valid0 = _errs13 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid0){
const err33 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate28.errors = vErrors;
evaluated0.props = props0;
return errors === 0;
}
validate28.evaluated = {"dynamicProps":true,"dynamicItems":false};


function validate27(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate27.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.id === undefined) || (!(func0.call(data, "id")))){
const err0 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if((data.name === undefined) || (!(func0.call(data, "name")))){
const err1 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if((data.anchorA === undefined) || (!(func0.call(data, "anchorA")))){
const err2 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "anchorA"},message:"must have required property '"+"anchorA"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if((data.anchorB === undefined) || (!(func0.call(data, "anchorB")))){
const err3 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "anchorB"},message:"must have required property '"+"anchorB"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if((data.collideConnected === undefined) || (!(func0.call(data, "collideConnected")))){
const err4 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "collideConnected"},message:"must have required property '"+"collideConnected"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((data.type === undefined) || (!(func0.call(data, "type")))){
const err5 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
for(const key0 of Object.keys(data)){
if(!((((((key0 === "id") || (key0 === "name")) || (key0 === "anchorA")) || (key0 === "anchorB")) || (key0 === "collideConnected")) || (key0 === "type"))){
const err6 = {instancePath,schemaPath:"#/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.id !== undefined && func0.call(data, "id")){
let data0 = data.id;
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
const err7 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.name !== undefined && func0.call(data, "name")){
let data1 = data.name;
if(typeof data1 === "string"){
if(func92(data1) > 120){
const err9 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/maxLength",keyword:"maxLength",params:{limit: 120},message:"must NOT have more than 120 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(func92(data1) < 1){
const err10 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.anchorA !== undefined && func0.call(data, "anchorA")){
if(!(validate28(data.anchorA, {instancePath:instancePath+"/anchorA",parentData:data,parentDataProperty:"anchorA",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate28.errors : vErrors.concat(validate28.errors);
errors = vErrors.length;
}
}
if(data.anchorB !== undefined && func0.call(data, "anchorB")){
if(!(validate28(data.anchorB, {instancePath:instancePath+"/anchorB",parentData:data,parentDataProperty:"anchorB",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate28.errors : vErrors.concat(validate28.errors);
errors = vErrors.length;
}
}
if(data.collideConnected !== undefined && func0.call(data, "collideConnected")){
if(typeof data.collideConnected !== "boolean"){
const err12 = {instancePath:instancePath+"/collideConnected",schemaPath:"#/oneOf/0/properties/collideConnected/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.type !== undefined && func0.call(data, "type")){
if("hinge" !== data.type){
const err13 = {instancePath:instancePath+"/type",schemaPath:"#/oneOf/0/properties/type/const",keyword:"const",params:{allowedValue: "hinge"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath,schemaPath:"#/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
var props2 = true;
}
const _errs15 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.id === undefined) || (!(func0.call(data, "id")))){
const err15 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if((data.name === undefined) || (!(func0.call(data, "name")))){
const err16 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if((data.anchorA === undefined) || (!(func0.call(data, "anchorA")))){
const err17 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "anchorA"},message:"must have required property '"+"anchorA"+"'"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if((data.anchorB === undefined) || (!(func0.call(data, "anchorB")))){
const err18 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "anchorB"},message:"must have required property '"+"anchorB"+"'"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if((data.collideConnected === undefined) || (!(func0.call(data, "collideConnected")))){
const err19 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "collideConnected"},message:"must have required property '"+"collideConnected"+"'"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if((data.type === undefined) || (!(func0.call(data, "type")))){
const err20 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
if((data.length === undefined) || (!(func0.call(data, "length")))){
const err21 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "length"},message:"must have required property '"+"length"+"'"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
for(const key1 of Object.keys(data)){
if(!(((((((key1 === "id") || (key1 === "name")) || (key1 === "anchorA")) || (key1 === "anchorB")) || (key1 === "collideConnected")) || (key1 === "type")) || (key1 === "length"))){
const err22 = {instancePath,schemaPath:"#/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data.id !== undefined && func0.call(data, "id")){
let data6 = data.id;
if(typeof data6 === "string"){
if(!(formats0.test(data6))){
const err23 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
else {
const err24 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data.name !== undefined && func0.call(data, "name")){
let data7 = data.name;
if(typeof data7 === "string"){
if(func92(data7) > 120){
const err25 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/maxLength",keyword:"maxLength",params:{limit: 120},message:"must NOT have more than 120 characters"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if(func92(data7) < 1){
const err26 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data.anchorA !== undefined && func0.call(data, "anchorA")){
if(!(validate28(data.anchorA, {instancePath:instancePath+"/anchorA",parentData:data,parentDataProperty:"anchorA",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate28.errors : vErrors.concat(validate28.errors);
errors = vErrors.length;
}
}
if(data.anchorB !== undefined && func0.call(data, "anchorB")){
if(!(validate28(data.anchorB, {instancePath:instancePath+"/anchorB",parentData:data,parentDataProperty:"anchorB",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate28.errors : vErrors.concat(validate28.errors);
errors = vErrors.length;
}
}
if(data.collideConnected !== undefined && func0.call(data, "collideConnected")){
if(typeof data.collideConnected !== "boolean"){
const err28 = {instancePath:instancePath+"/collideConnected",schemaPath:"#/oneOf/1/properties/collideConnected/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data.type !== undefined && func0.call(data, "type")){
if("rod" !== data.type){
const err29 = {instancePath:instancePath+"/type",schemaPath:"#/oneOf/1/properties/type/const",keyword:"const",params:{allowedValue: "rod"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
if(data.length !== undefined && func0.call(data, "length")){
let data12 = data.length;
if((typeof data12 == "number") && (isFinite(data12))){
if(data12 > 10000 || isNaN(data12)){
const err30 = {instancePath:instancePath+"/length",schemaPath:"#/oneOf/1/properties/length/maximum",keyword:"maximum",params:{comparison: "<=", limit: 10000},message:"must be <= 10000"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
if(data12 <= 0 || isNaN(data12)){
const err31 = {instancePath:instancePath+"/length",schemaPath:"#/oneOf/1/properties/length/exclusiveMinimum",keyword:"exclusiveMinimum",params:{comparison: ">", limit: 0},message:"must be > 0"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
else {
const err32 = {instancePath:instancePath+"/length",schemaPath:"#/oneOf/1/properties/length/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
}
else {
const err33 = {instancePath,schemaPath:"#/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
var _valid0 = _errs15 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
if(props2 !== true){
props2 = true;
}
}
const _errs31 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.id === undefined) || (!(func0.call(data, "id")))){
const err34 = {instancePath,schemaPath:"#/oneOf/2/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
if((data.name === undefined) || (!(func0.call(data, "name")))){
const err35 = {instancePath,schemaPath:"#/oneOf/2/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
if((data.anchorA === undefined) || (!(func0.call(data, "anchorA")))){
const err36 = {instancePath,schemaPath:"#/oneOf/2/required",keyword:"required",params:{missingProperty: "anchorA"},message:"must have required property '"+"anchorA"+"'"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
if((data.anchorB === undefined) || (!(func0.call(data, "anchorB")))){
const err37 = {instancePath,schemaPath:"#/oneOf/2/required",keyword:"required",params:{missingProperty: "anchorB"},message:"must have required property '"+"anchorB"+"'"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
if((data.collideConnected === undefined) || (!(func0.call(data, "collideConnected")))){
const err38 = {instancePath,schemaPath:"#/oneOf/2/required",keyword:"required",params:{missingProperty: "collideConnected"},message:"must have required property '"+"collideConnected"+"'"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
if((data.type === undefined) || (!(func0.call(data, "type")))){
const err39 = {instancePath,schemaPath:"#/oneOf/2/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
if((data.maxLength === undefined) || (!(func0.call(data, "maxLength")))){
const err40 = {instancePath,schemaPath:"#/oneOf/2/required",keyword:"required",params:{missingProperty: "maxLength"},message:"must have required property '"+"maxLength"+"'"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
for(const key2 of Object.keys(data)){
if(!(((((((key2 === "id") || (key2 === "name")) || (key2 === "anchorA")) || (key2 === "anchorB")) || (key2 === "collideConnected")) || (key2 === "type")) || (key2 === "maxLength"))){
const err41 = {instancePath,schemaPath:"#/oneOf/2/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
if(data.id !== undefined && func0.call(data, "id")){
let data13 = data.id;
if(typeof data13 === "string"){
if(!(formats0.test(data13))){
const err42 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
else {
const err43 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
}
if(data.name !== undefined && func0.call(data, "name")){
let data14 = data.name;
if(typeof data14 === "string"){
if(func92(data14) > 120){
const err44 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/maxLength",keyword:"maxLength",params:{limit: 120},message:"must NOT have more than 120 characters"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
if(func92(data14) < 1){
const err45 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
else {
const err46 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
if(data.anchorA !== undefined && func0.call(data, "anchorA")){
if(!(validate28(data.anchorA, {instancePath:instancePath+"/anchorA",parentData:data,parentDataProperty:"anchorA",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate28.errors : vErrors.concat(validate28.errors);
errors = vErrors.length;
}
}
if(data.anchorB !== undefined && func0.call(data, "anchorB")){
if(!(validate28(data.anchorB, {instancePath:instancePath+"/anchorB",parentData:data,parentDataProperty:"anchorB",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate28.errors : vErrors.concat(validate28.errors);
errors = vErrors.length;
}
}
if(data.collideConnected !== undefined && func0.call(data, "collideConnected")){
if(typeof data.collideConnected !== "boolean"){
const err47 = {instancePath:instancePath+"/collideConnected",schemaPath:"#/oneOf/2/properties/collideConnected/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
if(data.type !== undefined && func0.call(data, "type")){
if("rope" !== data.type){
const err48 = {instancePath:instancePath+"/type",schemaPath:"#/oneOf/2/properties/type/const",keyword:"const",params:{allowedValue: "rope"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
if(data.maxLength !== undefined && func0.call(data, "maxLength")){
let data19 = data.maxLength;
if((typeof data19 == "number") && (isFinite(data19))){
if(data19 > 10000 || isNaN(data19)){
const err49 = {instancePath:instancePath+"/maxLength",schemaPath:"#/oneOf/2/properties/maxLength/maximum",keyword:"maximum",params:{comparison: "<=", limit: 10000},message:"must be <= 10000"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
if(data19 <= 0 || isNaN(data19)){
const err50 = {instancePath:instancePath+"/maxLength",schemaPath:"#/oneOf/2/properties/maxLength/exclusiveMinimum",keyword:"exclusiveMinimum",params:{comparison: ">", limit: 0},message:"must be > 0"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
else {
const err51 = {instancePath:instancePath+"/maxLength",schemaPath:"#/oneOf/2/properties/maxLength/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
}
else {
const err52 = {instancePath,schemaPath:"#/oneOf/2/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
var _valid0 = _errs31 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 2];
}
else {
if(_valid0){
valid0 = true;
passing0 = 2;
if(props2 !== true){
props2 = true;
}
}
const _errs47 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.id === undefined) || (!(func0.call(data, "id")))){
const err53 = {instancePath,schemaPath:"#/oneOf/3/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
if((data.name === undefined) || (!(func0.call(data, "name")))){
const err54 = {instancePath,schemaPath:"#/oneOf/3/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
if((data.anchorA === undefined) || (!(func0.call(data, "anchorA")))){
const err55 = {instancePath,schemaPath:"#/oneOf/3/required",keyword:"required",params:{missingProperty: "anchorA"},message:"must have required property '"+"anchorA"+"'"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
if((data.anchorB === undefined) || (!(func0.call(data, "anchorB")))){
const err56 = {instancePath,schemaPath:"#/oneOf/3/required",keyword:"required",params:{missingProperty: "anchorB"},message:"must have required property '"+"anchorB"+"'"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
if((data.collideConnected === undefined) || (!(func0.call(data, "collideConnected")))){
const err57 = {instancePath,schemaPath:"#/oneOf/3/required",keyword:"required",params:{missingProperty: "collideConnected"},message:"must have required property '"+"collideConnected"+"'"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
if((data.type === undefined) || (!(func0.call(data, "type")))){
const err58 = {instancePath,schemaPath:"#/oneOf/3/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
if((data.restLength === undefined) || (!(func0.call(data, "restLength")))){
const err59 = {instancePath,schemaPath:"#/oneOf/3/required",keyword:"required",params:{missingProperty: "restLength"},message:"must have required property '"+"restLength"+"'"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
if((data.springConstant === undefined) || (!(func0.call(data, "springConstant")))){
const err60 = {instancePath,schemaPath:"#/oneOf/3/required",keyword:"required",params:{missingProperty: "springConstant"},message:"must have required property '"+"springConstant"+"'"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
if((data.dampingCoefficient === undefined) || (!(func0.call(data, "dampingCoefficient")))){
const err61 = {instancePath,schemaPath:"#/oneOf/3/required",keyword:"required",params:{missingProperty: "dampingCoefficient"},message:"must have required property '"+"dampingCoefficient"+"'"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
for(const key3 of Object.keys(data)){
if(!(func0.call(schema46.oneOf[3].properties, key3))){
const err62 = {instancePath,schemaPath:"#/oneOf/3/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
if(data.id !== undefined && func0.call(data, "id")){
let data20 = data.id;
if(typeof data20 === "string"){
if(!(formats0.test(data20))){
const err63 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
}
else {
const err64 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
}
if(data.name !== undefined && func0.call(data, "name")){
let data21 = data.name;
if(typeof data21 === "string"){
if(func92(data21) > 120){
const err65 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/maxLength",keyword:"maxLength",params:{limit: 120},message:"must NOT have more than 120 characters"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
if(func92(data21) < 1){
const err66 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
}
else {
const err67 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
if(data.anchorA !== undefined && func0.call(data, "anchorA")){
if(!(validate28(data.anchorA, {instancePath:instancePath+"/anchorA",parentData:data,parentDataProperty:"anchorA",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate28.errors : vErrors.concat(validate28.errors);
errors = vErrors.length;
}
}
if(data.anchorB !== undefined && func0.call(data, "anchorB")){
if(!(validate28(data.anchorB, {instancePath:instancePath+"/anchorB",parentData:data,parentDataProperty:"anchorB",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate28.errors : vErrors.concat(validate28.errors);
errors = vErrors.length;
}
}
if(data.collideConnected !== undefined && func0.call(data, "collideConnected")){
if(typeof data.collideConnected !== "boolean"){
const err68 = {instancePath:instancePath+"/collideConnected",schemaPath:"#/oneOf/3/properties/collideConnected/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
}
if(data.type !== undefined && func0.call(data, "type")){
if("spring" !== data.type){
const err69 = {instancePath:instancePath+"/type",schemaPath:"#/oneOf/3/properties/type/const",keyword:"const",params:{allowedValue: "spring"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
}
if(data.restLength !== undefined && func0.call(data, "restLength")){
let data26 = data.restLength;
if((typeof data26 == "number") && (isFinite(data26))){
if(data26 > 10000 || isNaN(data26)){
const err70 = {instancePath:instancePath+"/restLength",schemaPath:"#/oneOf/3/properties/restLength/maximum",keyword:"maximum",params:{comparison: "<=", limit: 10000},message:"must be <= 10000"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
if(data26 <= 0 || isNaN(data26)){
const err71 = {instancePath:instancePath+"/restLength",schemaPath:"#/oneOf/3/properties/restLength/exclusiveMinimum",keyword:"exclusiveMinimum",params:{comparison: ">", limit: 0},message:"must be > 0"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
else {
const err72 = {instancePath:instancePath+"/restLength",schemaPath:"#/oneOf/3/properties/restLength/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
}
if(data.springConstant !== undefined && func0.call(data, "springConstant")){
let data27 = data.springConstant;
if((typeof data27 == "number") && (isFinite(data27))){
if(data27 > 1000000 || isNaN(data27)){
const err73 = {instancePath:instancePath+"/springConstant",schemaPath:"#/oneOf/3/properties/springConstant/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
if(data27 <= 0 || isNaN(data27)){
const err74 = {instancePath:instancePath+"/springConstant",schemaPath:"#/oneOf/3/properties/springConstant/exclusiveMinimum",keyword:"exclusiveMinimum",params:{comparison: ">", limit: 0},message:"must be > 0"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
}
else {
const err75 = {instancePath:instancePath+"/springConstant",schemaPath:"#/oneOf/3/properties/springConstant/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
}
if(data.dampingCoefficient !== undefined && func0.call(data, "dampingCoefficient")){
let data28 = data.dampingCoefficient;
if((typeof data28 == "number") && (isFinite(data28))){
if(data28 > 1000000 || isNaN(data28)){
const err76 = {instancePath:instancePath+"/dampingCoefficient",schemaPath:"#/oneOf/3/properties/dampingCoefficient/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
if(data28 < 0 || isNaN(data28)){
const err77 = {instancePath:instancePath+"/dampingCoefficient",schemaPath:"#/oneOf/3/properties/dampingCoefficient/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
}
else {
const err78 = {instancePath:instancePath+"/dampingCoefficient",schemaPath:"#/oneOf/3/properties/dampingCoefficient/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err78];
}
else {
vErrors.push(err78);
}
errors++;
}
}
}
else {
const err79 = {instancePath,schemaPath:"#/oneOf/3/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err79];
}
else {
vErrors.push(err79);
}
errors++;
}
var _valid0 = _errs47 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 3];
}
else {
if(_valid0){
valid0 = true;
passing0 = 3;
if(props2 !== true){
props2 = true;
}
}
}
}
}
if(!valid0){
const err80 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err80];
}
else {
vErrors.push(err80);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate27.errors = vErrors;
evaluated0.props = props2;
return errors === 0;
}
validate27.evaluated = {"dynamicProps":true,"dynamicItems":false};

const schema59 = {"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"type":{"const":"constantForce"},"bodyId":{"$ref":"#/$defs/id"},"vector":{"$ref":"#/$defs/vector"},"localPoint":{"$ref":"#/$defs/vector"}},"required":["id","type","bodyId","vector","localPoint"]};

function validate38(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate38.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.id === undefined) || (!(func0.call(data, "id")))){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if((data.type === undefined) || (!(func0.call(data, "type")))){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if((data.bodyId === undefined) || (!(func0.call(data, "bodyId")))){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "bodyId"},message:"must have required property '"+"bodyId"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if((data.vector === undefined) || (!(func0.call(data, "vector")))){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "vector"},message:"must have required property '"+"vector"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if((data.localPoint === undefined) || (!(func0.call(data, "localPoint")))){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "localPoint"},message:"must have required property '"+"localPoint"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key0 of Object.keys(data)){
if(!(((((key0 === "id") || (key0 === "type")) || (key0 === "bodyId")) || (key0 === "vector")) || (key0 === "localPoint"))){
const err5 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.id !== undefined && func0.call(data, "id")){
let data0 = data.id;
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
const err6 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.type !== undefined && func0.call(data, "type")){
if("constantForce" !== data.type){
const err8 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "constantForce"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.bodyId !== undefined && func0.call(data, "bodyId")){
let data2 = data.bodyId;
if(typeof data2 === "string"){
if(!(formats0.test(data2))){
const err9 = {instancePath:instancePath+"/bodyId",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
else {
const err10 = {instancePath:instancePath+"/bodyId",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.vector !== undefined && func0.call(data, "vector")){
let data3 = data.vector;
if(data3 && typeof data3 == "object" && !Array.isArray(data3)){
if((data3.x === undefined) || (!(func0.call(data3, "x")))){
const err11 = {instancePath:instancePath+"/vector",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "x"},message:"must have required property '"+"x"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if((data3.y === undefined) || (!(func0.call(data3, "y")))){
const err12 = {instancePath:instancePath+"/vector",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "y"},message:"must have required property '"+"y"+"'"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
for(const key1 of Object.keys(data3)){
if(!((key1 === "x") || (key1 === "y"))){
const err13 = {instancePath:instancePath+"/vector",schemaPath:"#/$defs/vector/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data3.x !== undefined && func0.call(data3, "x")){
let data4 = data3.x;
if((typeof data4 == "number") && (isFinite(data4))){
if(data4 > 1000000 || isNaN(data4)){
const err14 = {instancePath:instancePath+"/vector/x",schemaPath:"#/$defs/vector/properties/x/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(data4 < -1000000 || isNaN(data4)){
const err15 = {instancePath:instancePath+"/vector/x",schemaPath:"#/$defs/vector/properties/x/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/vector/x",schemaPath:"#/$defs/vector/properties/x/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data3.y !== undefined && func0.call(data3, "y")){
let data5 = data3.y;
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 > 1000000 || isNaN(data5)){
const err17 = {instancePath:instancePath+"/vector/y",schemaPath:"#/$defs/vector/properties/y/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(data5 < -1000000 || isNaN(data5)){
const err18 = {instancePath:instancePath+"/vector/y",schemaPath:"#/$defs/vector/properties/y/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
else {
const err19 = {instancePath:instancePath+"/vector/y",schemaPath:"#/$defs/vector/properties/y/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
}
else {
const err20 = {instancePath:instancePath+"/vector",schemaPath:"#/$defs/vector/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data.localPoint !== undefined && func0.call(data, "localPoint")){
let data6 = data.localPoint;
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
if((data6.x === undefined) || (!(func0.call(data6, "x")))){
const err21 = {instancePath:instancePath+"/localPoint",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "x"},message:"must have required property '"+"x"+"'"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if((data6.y === undefined) || (!(func0.call(data6, "y")))){
const err22 = {instancePath:instancePath+"/localPoint",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "y"},message:"must have required property '"+"y"+"'"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
for(const key2 of Object.keys(data6)){
if(!((key2 === "x") || (key2 === "y"))){
const err23 = {instancePath:instancePath+"/localPoint",schemaPath:"#/$defs/vector/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data6.x !== undefined && func0.call(data6, "x")){
let data7 = data6.x;
if((typeof data7 == "number") && (isFinite(data7))){
if(data7 > 1000000 || isNaN(data7)){
const err24 = {instancePath:instancePath+"/localPoint/x",schemaPath:"#/$defs/vector/properties/x/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
if(data7 < -1000000 || isNaN(data7)){
const err25 = {instancePath:instancePath+"/localPoint/x",schemaPath:"#/$defs/vector/properties/x/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
else {
const err26 = {instancePath:instancePath+"/localPoint/x",schemaPath:"#/$defs/vector/properties/x/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
if(data6.y !== undefined && func0.call(data6, "y")){
let data8 = data6.y;
if((typeof data8 == "number") && (isFinite(data8))){
if(data8 > 1000000 || isNaN(data8)){
const err27 = {instancePath:instancePath+"/localPoint/y",schemaPath:"#/$defs/vector/properties/y/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
if(data8 < -1000000 || isNaN(data8)){
const err28 = {instancePath:instancePath+"/localPoint/y",schemaPath:"#/$defs/vector/properties/y/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/localPoint/y",schemaPath:"#/$defs/vector/properties/y/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
}
else {
const err30 = {instancePath:instancePath+"/localPoint",schemaPath:"#/$defs/vector/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
}
else {
const err31 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
validate38.errors = vErrors;
return errors === 0;
}
validate38.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema64 = {"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"bodyId":{"$ref":"#/$defs/id"},"quantity":{"enum":["positionX","positionY","velocityX","velocityY","accelerationX","accelerationY","angularVelocity","kineticEnergy"]},"display":{"enum":["meter","graph","both"]},"sampleEveryTicks":{"type":"integer","minimum":1,"maximum":1200},"maxSamples":{"type":"integer","minimum":1,"maximum":72000}},"required":["id","bodyId","quantity","display","sampleEveryTicks","maxSamples"]};

function validate40(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate40.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.id === undefined) || (!(func0.call(data, "id")))){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if((data.bodyId === undefined) || (!(func0.call(data, "bodyId")))){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "bodyId"},message:"must have required property '"+"bodyId"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if((data.quantity === undefined) || (!(func0.call(data, "quantity")))){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "quantity"},message:"must have required property '"+"quantity"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if((data.display === undefined) || (!(func0.call(data, "display")))){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "display"},message:"must have required property '"+"display"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if((data.sampleEveryTicks === undefined) || (!(func0.call(data, "sampleEveryTicks")))){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sampleEveryTicks"},message:"must have required property '"+"sampleEveryTicks"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((data.maxSamples === undefined) || (!(func0.call(data, "maxSamples")))){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "maxSamples"},message:"must have required property '"+"maxSamples"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
for(const key0 of Object.keys(data)){
if(!((((((key0 === "id") || (key0 === "bodyId")) || (key0 === "quantity")) || (key0 === "display")) || (key0 === "sampleEveryTicks")) || (key0 === "maxSamples"))){
const err6 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.id !== undefined && func0.call(data, "id")){
let data0 = data.id;
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
const err7 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.bodyId !== undefined && func0.call(data, "bodyId")){
let data1 = data.bodyId;
if(typeof data1 === "string"){
if(!(formats0.test(data1))){
const err9 = {instancePath:instancePath+"/bodyId",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
else {
const err10 = {instancePath:instancePath+"/bodyId",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.quantity !== undefined && func0.call(data, "quantity")){
let data2 = data.quantity;
if(!((((((((data2 === "positionX") || (data2 === "positionY")) || (data2 === "velocityX")) || (data2 === "velocityY")) || (data2 === "accelerationX")) || (data2 === "accelerationY")) || (data2 === "angularVelocity")) || (data2 === "kineticEnergy"))){
const err11 = {instancePath:instancePath+"/quantity",schemaPath:"#/properties/quantity/enum",keyword:"enum",params:{allowedValues: schema64.properties.quantity.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.display !== undefined && func0.call(data, "display")){
let data3 = data.display;
if(!(((data3 === "meter") || (data3 === "graph")) || (data3 === "both"))){
const err12 = {instancePath:instancePath+"/display",schemaPath:"#/properties/display/enum",keyword:"enum",params:{allowedValues: schema64.properties.display.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.sampleEveryTicks !== undefined && func0.call(data, "sampleEveryTicks")){
let data4 = data.sampleEveryTicks;
if(!(((typeof data4 == "number") && (!(data4 % 1) && !isNaN(data4))) && (isFinite(data4)))){
const err13 = {instancePath:instancePath+"/sampleEveryTicks",schemaPath:"#/properties/sampleEveryTicks/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if((typeof data4 == "number") && (isFinite(data4))){
if(data4 > 1200 || isNaN(data4)){
const err14 = {instancePath:instancePath+"/sampleEveryTicks",schemaPath:"#/properties/sampleEveryTicks/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1200},message:"must be <= 1200"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(data4 < 1 || isNaN(data4)){
const err15 = {instancePath:instancePath+"/sampleEveryTicks",schemaPath:"#/properties/sampleEveryTicks/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
}
if(data.maxSamples !== undefined && func0.call(data, "maxSamples")){
let data5 = data.maxSamples;
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
const err16 = {instancePath:instancePath+"/maxSamples",schemaPath:"#/properties/maxSamples/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 > 72000 || isNaN(data5)){
const err17 = {instancePath:instancePath+"/maxSamples",schemaPath:"#/properties/maxSamples/maximum",keyword:"maximum",params:{comparison: "<=", limit: 72000},message:"must be <= 72000"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(data5 < 1 || isNaN(data5)){
const err18 = {instancePath:instancePath+"/maxSamples",schemaPath:"#/properties/maxSamples/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
}
}
else {
const err19 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
validate40.errors = vErrors;
return errors === 0;
}
validate40.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema67 = {"oneOf":[{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"label":{"$ref":"#/$defs/name"},"min":{"type":"number","minimum":-1000000,"maximum":1000000},"max":{"type":"number","minimum":-1000000,"maximum":1000000},"step":{"type":"number","exclusiveMinimum":0,"maximum":1000000},"target":{"type":"object","additionalProperties":false,"properties":{"type":{"const":"body"},"bodyId":{"$ref":"#/$defs/id"},"parameter":{"enum":["mass","velocityX","velocityY"]}},"required":["type","bodyId","parameter"]}},"required":["id","label","min","max","step","target"]},{"type":"object","additionalProperties":false,"properties":{"id":{"$ref":"#/$defs/id"},"label":{"$ref":"#/$defs/name"},"min":{"type":"number","minimum":-1000000,"maximum":1000000},"max":{"type":"number","minimum":-1000000,"maximum":1000000},"step":{"type":"number","exclusiveMinimum":0,"maximum":1000000},"target":{"type":"object","additionalProperties":false,"properties":{"type":{"const":"world"},"parameter":{"enum":["gravityX","gravityY"]}},"required":["type","parameter"]}},"required":["id","label","min","max","step","target"]}]};

function validate42(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate42.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.id === undefined) || (!(func0.call(data, "id")))){
const err0 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if((data.label === undefined) || (!(func0.call(data, "label")))){
const err1 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "label"},message:"must have required property '"+"label"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if((data.min === undefined) || (!(func0.call(data, "min")))){
const err2 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "min"},message:"must have required property '"+"min"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if((data.max === undefined) || (!(func0.call(data, "max")))){
const err3 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "max"},message:"must have required property '"+"max"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if((data.step === undefined) || (!(func0.call(data, "step")))){
const err4 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "step"},message:"must have required property '"+"step"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((data.target === undefined) || (!(func0.call(data, "target")))){
const err5 = {instancePath,schemaPath:"#/oneOf/0/required",keyword:"required",params:{missingProperty: "target"},message:"must have required property '"+"target"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
for(const key0 of Object.keys(data)){
if(!((((((key0 === "id") || (key0 === "label")) || (key0 === "min")) || (key0 === "max")) || (key0 === "step")) || (key0 === "target"))){
const err6 = {instancePath,schemaPath:"#/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.id !== undefined && func0.call(data, "id")){
let data0 = data.id;
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
const err7 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.label !== undefined && func0.call(data, "label")){
let data1 = data.label;
if(typeof data1 === "string"){
if(func92(data1) > 120){
const err9 = {instancePath:instancePath+"/label",schemaPath:"#/$defs/name/maxLength",keyword:"maxLength",params:{limit: 120},message:"must NOT have more than 120 characters"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(func92(data1) < 1){
const err10 = {instancePath:instancePath+"/label",schemaPath:"#/$defs/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/label",schemaPath:"#/$defs/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.min !== undefined && func0.call(data, "min")){
let data2 = data.min;
if((typeof data2 == "number") && (isFinite(data2))){
if(data2 > 1000000 || isNaN(data2)){
const err12 = {instancePath:instancePath+"/min",schemaPath:"#/oneOf/0/properties/min/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(data2 < -1000000 || isNaN(data2)){
const err13 = {instancePath:instancePath+"/min",schemaPath:"#/oneOf/0/properties/min/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/min",schemaPath:"#/oneOf/0/properties/min/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.max !== undefined && func0.call(data, "max")){
let data3 = data.max;
if((typeof data3 == "number") && (isFinite(data3))){
if(data3 > 1000000 || isNaN(data3)){
const err15 = {instancePath:instancePath+"/max",schemaPath:"#/oneOf/0/properties/max/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(data3 < -1000000 || isNaN(data3)){
const err16 = {instancePath:instancePath+"/max",schemaPath:"#/oneOf/0/properties/max/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/max",schemaPath:"#/oneOf/0/properties/max/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.step !== undefined && func0.call(data, "step")){
let data4 = data.step;
if((typeof data4 == "number") && (isFinite(data4))){
if(data4 > 1000000 || isNaN(data4)){
const err18 = {instancePath:instancePath+"/step",schemaPath:"#/oneOf/0/properties/step/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(data4 <= 0 || isNaN(data4)){
const err19 = {instancePath:instancePath+"/step",schemaPath:"#/oneOf/0/properties/step/exclusiveMinimum",keyword:"exclusiveMinimum",params:{comparison: ">", limit: 0},message:"must be > 0"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
else {
const err20 = {instancePath:instancePath+"/step",schemaPath:"#/oneOf/0/properties/step/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data.target !== undefined && func0.call(data, "target")){
let data5 = data.target;
if(data5 && typeof data5 == "object" && !Array.isArray(data5)){
if((data5.type === undefined) || (!(func0.call(data5, "type")))){
const err21 = {instancePath:instancePath+"/target",schemaPath:"#/oneOf/0/properties/target/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if((data5.bodyId === undefined) || (!(func0.call(data5, "bodyId")))){
const err22 = {instancePath:instancePath+"/target",schemaPath:"#/oneOf/0/properties/target/required",keyword:"required",params:{missingProperty: "bodyId"},message:"must have required property '"+"bodyId"+"'"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if((data5.parameter === undefined) || (!(func0.call(data5, "parameter")))){
const err23 = {instancePath:instancePath+"/target",schemaPath:"#/oneOf/0/properties/target/required",keyword:"required",params:{missingProperty: "parameter"},message:"must have required property '"+"parameter"+"'"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
for(const key1 of Object.keys(data5)){
if(!(((key1 === "type") || (key1 === "bodyId")) || (key1 === "parameter"))){
const err24 = {instancePath:instancePath+"/target",schemaPath:"#/oneOf/0/properties/target/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data5.type !== undefined && func0.call(data5, "type")){
if("body" !== data5.type){
const err25 = {instancePath:instancePath+"/target/type",schemaPath:"#/oneOf/0/properties/target/properties/type/const",keyword:"const",params:{allowedValue: "body"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data5.bodyId !== undefined && func0.call(data5, "bodyId")){
let data7 = data5.bodyId;
if(typeof data7 === "string"){
if(!(formats0.test(data7))){
const err26 = {instancePath:instancePath+"/target/bodyId",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/target/bodyId",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data5.parameter !== undefined && func0.call(data5, "parameter")){
let data8 = data5.parameter;
if(!(((data8 === "mass") || (data8 === "velocityX")) || (data8 === "velocityY"))){
const err28 = {instancePath:instancePath+"/target/parameter",schemaPath:"#/oneOf/0/properties/target/properties/parameter/enum",keyword:"enum",params:{allowedValues: schema67.oneOf[0].properties.target.properties.parameter.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
}
else {
const err29 = {instancePath:instancePath+"/target",schemaPath:"#/oneOf/0/properties/target/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
}
else {
const err30 = {instancePath,schemaPath:"#/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
var props0 = true;
}
const _errs24 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.id === undefined) || (!(func0.call(data, "id")))){
const err31 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
if((data.label === undefined) || (!(func0.call(data, "label")))){
const err32 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "label"},message:"must have required property '"+"label"+"'"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if((data.min === undefined) || (!(func0.call(data, "min")))){
const err33 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "min"},message:"must have required property '"+"min"+"'"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
if((data.max === undefined) || (!(func0.call(data, "max")))){
const err34 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "max"},message:"must have required property '"+"max"+"'"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
if((data.step === undefined) || (!(func0.call(data, "step")))){
const err35 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "step"},message:"must have required property '"+"step"+"'"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
if((data.target === undefined) || (!(func0.call(data, "target")))){
const err36 = {instancePath,schemaPath:"#/oneOf/1/required",keyword:"required",params:{missingProperty: "target"},message:"must have required property '"+"target"+"'"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
for(const key2 of Object.keys(data)){
if(!((((((key2 === "id") || (key2 === "label")) || (key2 === "min")) || (key2 === "max")) || (key2 === "step")) || (key2 === "target"))){
const err37 = {instancePath,schemaPath:"#/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
if(data.id !== undefined && func0.call(data, "id")){
let data9 = data.id;
if(typeof data9 === "string"){
if(!(formats0.test(data9))){
const err38 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
else {
const err39 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
if(data.label !== undefined && func0.call(data, "label")){
let data10 = data.label;
if(typeof data10 === "string"){
if(func92(data10) > 120){
const err40 = {instancePath:instancePath+"/label",schemaPath:"#/$defs/name/maxLength",keyword:"maxLength",params:{limit: 120},message:"must NOT have more than 120 characters"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
if(func92(data10) < 1){
const err41 = {instancePath:instancePath+"/label",schemaPath:"#/$defs/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
else {
const err42 = {instancePath:instancePath+"/label",schemaPath:"#/$defs/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
if(data.min !== undefined && func0.call(data, "min")){
let data11 = data.min;
if((typeof data11 == "number") && (isFinite(data11))){
if(data11 > 1000000 || isNaN(data11)){
const err43 = {instancePath:instancePath+"/min",schemaPath:"#/oneOf/1/properties/min/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
if(data11 < -1000000 || isNaN(data11)){
const err44 = {instancePath:instancePath+"/min",schemaPath:"#/oneOf/1/properties/min/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
else {
const err45 = {instancePath:instancePath+"/min",schemaPath:"#/oneOf/1/properties/min/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
if(data.max !== undefined && func0.call(data, "max")){
let data12 = data.max;
if((typeof data12 == "number") && (isFinite(data12))){
if(data12 > 1000000 || isNaN(data12)){
const err46 = {instancePath:instancePath+"/max",schemaPath:"#/oneOf/1/properties/max/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
if(data12 < -1000000 || isNaN(data12)){
const err47 = {instancePath:instancePath+"/max",schemaPath:"#/oneOf/1/properties/max/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
else {
const err48 = {instancePath:instancePath+"/max",schemaPath:"#/oneOf/1/properties/max/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
if(data.step !== undefined && func0.call(data, "step")){
let data13 = data.step;
if((typeof data13 == "number") && (isFinite(data13))){
if(data13 > 1000000 || isNaN(data13)){
const err49 = {instancePath:instancePath+"/step",schemaPath:"#/oneOf/1/properties/step/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
if(data13 <= 0 || isNaN(data13)){
const err50 = {instancePath:instancePath+"/step",schemaPath:"#/oneOf/1/properties/step/exclusiveMinimum",keyword:"exclusiveMinimum",params:{comparison: ">", limit: 0},message:"must be > 0"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
else {
const err51 = {instancePath:instancePath+"/step",schemaPath:"#/oneOf/1/properties/step/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
if(data.target !== undefined && func0.call(data, "target")){
let data14 = data.target;
if(data14 && typeof data14 == "object" && !Array.isArray(data14)){
if((data14.type === undefined) || (!(func0.call(data14, "type")))){
const err52 = {instancePath:instancePath+"/target",schemaPath:"#/oneOf/1/properties/target/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
if((data14.parameter === undefined) || (!(func0.call(data14, "parameter")))){
const err53 = {instancePath:instancePath+"/target",schemaPath:"#/oneOf/1/properties/target/required",keyword:"required",params:{missingProperty: "parameter"},message:"must have required property '"+"parameter"+"'"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
for(const key3 of Object.keys(data14)){
if(!((key3 === "type") || (key3 === "parameter"))){
const err54 = {instancePath:instancePath+"/target",schemaPath:"#/oneOf/1/properties/target/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
if(data14.type !== undefined && func0.call(data14, "type")){
if("world" !== data14.type){
const err55 = {instancePath:instancePath+"/target/type",schemaPath:"#/oneOf/1/properties/target/properties/type/const",keyword:"const",params:{allowedValue: "world"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
}
if(data14.parameter !== undefined && func0.call(data14, "parameter")){
let data16 = data14.parameter;
if(!((data16 === "gravityX") || (data16 === "gravityY"))){
const err56 = {instancePath:instancePath+"/target/parameter",schemaPath:"#/oneOf/1/properties/target/properties/parameter/enum",keyword:"enum",params:{allowedValues: schema67.oneOf[1].properties.target.properties.parameter.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
}
else {
const err57 = {instancePath:instancePath+"/target",schemaPath:"#/oneOf/1/properties/target/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
}
else {
const err58 = {instancePath,schemaPath:"#/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
var _valid0 = _errs24 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid0){
const err59 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate42.errors = vErrors;
evaluated0.props = props0;
return errors === 0;
}
validate42.evaluated = {"dynamicProps":true,"dynamicItems":false};

const pattern4 = new RegExp("^\\d+\\.\\d+\\.\\d+$", "u");
const pattern6 = new RegExp("^[a-z0-9][a-z0-9.-]{0,79}$", "u");

function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://baanphys.example/schemas/scene-v1.schema.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate20.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if((data.schemaVersion === undefined) || (!(func0.call(data, "schemaVersion")))){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if((data.identity === undefined) || (!(func0.call(data, "identity")))){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "identity"},message:"must have required property '"+"identity"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if((data.title === undefined) || (!(func0.call(data, "title")))){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "title"},message:"must have required property '"+"title"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if((data.units === undefined) || (!(func0.call(data, "units")))){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "units"},message:"must have required property '"+"units"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if((data.world === undefined) || (!(func0.call(data, "world")))){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "world"},message:"must have required property '"+"world"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if((data.simulation === undefined) || (!(func0.call(data, "simulation")))){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "simulation"},message:"must have required property '"+"simulation"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if((data.bodies === undefined) || (!(func0.call(data, "bodies")))){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "bodies"},message:"must have required property '"+"bodies"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if((data.constraints === undefined) || (!(func0.call(data, "constraints")))){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "constraints"},message:"must have required property '"+"constraints"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if((data.forces === undefined) || (!(func0.call(data, "forces")))){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "forces"},message:"must have required property '"+"forces"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((data.measurements === undefined) || (!(func0.call(data, "measurements")))){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "measurements"},message:"must have required property '"+"measurements"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if((data.studentPolicy === undefined) || (!(func0.call(data, "studentPolicy")))){
const err10 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "studentPolicy"},message:"must have required property '"+"studentPolicy"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if((data.view === undefined) || (!(func0.call(data, "view")))){
const err11 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "view"},message:"must have required property '"+"view"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
for(const key0 of Object.keys(data)){
if(!(func0.call(schema31.properties, key0))){
const err12 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.schemaVersion !== undefined && func0.call(data, "schemaVersion")){
if(1 !== data.schemaVersion){
const err13 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.identity !== undefined && func0.call(data, "identity")){
if(!(validate21(data.identity, {instancePath:instancePath+"/identity",parentData:data,parentDataProperty:"identity",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
errors = vErrors.length;
}
}
if(data.title !== undefined && func0.call(data, "title")){
let data2 = data.title;
if(typeof data2 === "string"){
if(func92(data2) > 200){
const err14 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/maxLength",keyword:"maxLength",params:{limit: 200},message:"must NOT have more than 200 characters"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(func92(data2) < 1){
const err15 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.description !== undefined && func0.call(data, "description")){
let data3 = data.description;
if(typeof data3 === "string"){
if(func92(data3) > 4000){
const err17 = {instancePath:instancePath+"/description",schemaPath:"#/properties/description/maxLength",keyword:"maxLength",params:{limit: 4000},message:"must NOT have more than 4000 characters"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
else {
const err18 = {instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data.units !== undefined && func0.call(data, "units")){
if("SI" !== data.units){
const err19 = {instancePath:instancePath+"/units",schemaPath:"#/properties/units/const",keyword:"const",params:{allowedValue: "SI"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.world !== undefined && func0.call(data, "world")){
let data5 = data.world;
if(data5 && typeof data5 == "object" && !Array.isArray(data5)){
if((data5.gravity === undefined) || (!(func0.call(data5, "gravity")))){
const err20 = {instancePath:instancePath+"/world",schemaPath:"#/properties/world/required",keyword:"required",params:{missingProperty: "gravity"},message:"must have required property '"+"gravity"+"'"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
for(const key1 of Object.keys(data5)){
if(!(key1 === "gravity")){
const err21 = {instancePath:instancePath+"/world",schemaPath:"#/properties/world/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data5.gravity !== undefined && func0.call(data5, "gravity")){
let data6 = data5.gravity;
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
if((data6.x === undefined) || (!(func0.call(data6, "x")))){
const err22 = {instancePath:instancePath+"/world/gravity",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "x"},message:"must have required property '"+"x"+"'"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if((data6.y === undefined) || (!(func0.call(data6, "y")))){
const err23 = {instancePath:instancePath+"/world/gravity",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "y"},message:"must have required property '"+"y"+"'"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
for(const key2 of Object.keys(data6)){
if(!((key2 === "x") || (key2 === "y"))){
const err24 = {instancePath:instancePath+"/world/gravity",schemaPath:"#/$defs/vector/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data6.x !== undefined && func0.call(data6, "x")){
let data7 = data6.x;
if((typeof data7 == "number") && (isFinite(data7))){
if(data7 > 1000000 || isNaN(data7)){
const err25 = {instancePath:instancePath+"/world/gravity/x",schemaPath:"#/$defs/vector/properties/x/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if(data7 < -1000000 || isNaN(data7)){
const err26 = {instancePath:instancePath+"/world/gravity/x",schemaPath:"#/$defs/vector/properties/x/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/world/gravity/x",schemaPath:"#/$defs/vector/properties/x/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data6.y !== undefined && func0.call(data6, "y")){
let data8 = data6.y;
if((typeof data8 == "number") && (isFinite(data8))){
if(data8 > 1000000 || isNaN(data8)){
const err28 = {instancePath:instancePath+"/world/gravity/y",schemaPath:"#/$defs/vector/properties/y/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
if(data8 < -1000000 || isNaN(data8)){
const err29 = {instancePath:instancePath+"/world/gravity/y",schemaPath:"#/$defs/vector/properties/y/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
else {
const err30 = {instancePath:instancePath+"/world/gravity/y",schemaPath:"#/$defs/vector/properties/y/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
}
else {
const err31 = {instancePath:instancePath+"/world/gravity",schemaPath:"#/$defs/vector/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
}
else {
const err32 = {instancePath:instancePath+"/world",schemaPath:"#/properties/world/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
if(data.simulation !== undefined && func0.call(data, "simulation")){
let data9 = data.simulation;
if(data9 && typeof data9 == "object" && !Array.isArray(data9)){
if((data9.engine === undefined) || (!(func0.call(data9, "engine")))){
const err33 = {instancePath:instancePath+"/simulation",schemaPath:"#/$defs/simulation/required",keyword:"required",params:{missingProperty: "engine"},message:"must have required property '"+"engine"+"'"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
if((data9.timestepSeconds === undefined) || (!(func0.call(data9, "timestepSeconds")))){
const err34 = {instancePath:instancePath+"/simulation",schemaPath:"#/$defs/simulation/required",keyword:"required",params:{missingProperty: "timestepSeconds"},message:"must have required property '"+"timestepSeconds"+"'"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
if((data9.substeps === undefined) || (!(func0.call(data9, "substeps")))){
const err35 = {instancePath:instancePath+"/simulation",schemaPath:"#/$defs/simulation/required",keyword:"required",params:{missingProperty: "substeps"},message:"must have required property '"+"substeps"+"'"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
if((data9.solverIterations === undefined) || (!(func0.call(data9, "solverIterations")))){
const err36 = {instancePath:instancePath+"/simulation",schemaPath:"#/$defs/simulation/required",keyword:"required",params:{missingProperty: "solverIterations"},message:"must have required property '"+"solverIterations"+"'"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
if((data9.sleeping === undefined) || (!(func0.call(data9, "sleeping")))){
const err37 = {instancePath:instancePath+"/simulation",schemaPath:"#/$defs/simulation/required",keyword:"required",params:{missingProperty: "sleeping"},message:"must have required property '"+"sleeping"+"'"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
if((data9.seed === undefined) || (!(func0.call(data9, "seed")))){
const err38 = {instancePath:instancePath+"/simulation",schemaPath:"#/$defs/simulation/required",keyword:"required",params:{missingProperty: "seed"},message:"must have required property '"+"seed"+"'"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
for(const key3 of Object.keys(data9)){
if(!((((((key3 === "engine") || (key3 === "timestepSeconds")) || (key3 === "substeps")) || (key3 === "solverIterations")) || (key3 === "sleeping")) || (key3 === "seed"))){
const err39 = {instancePath:instancePath+"/simulation",schemaPath:"#/$defs/simulation/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
if(data9.engine !== undefined && func0.call(data9, "engine")){
let data10 = data9.engine;
if(data10 && typeof data10 == "object" && !Array.isArray(data10)){
if((data10.name === undefined) || (!(func0.call(data10, "name")))){
const err40 = {instancePath:instancePath+"/simulation/engine",schemaPath:"#/$defs/simulation/properties/engine/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
if((data10.version === undefined) || (!(func0.call(data10, "version")))){
const err41 = {instancePath:instancePath+"/simulation/engine",schemaPath:"#/$defs/simulation/properties/engine/required",keyword:"required",params:{missingProperty: "version"},message:"must have required property '"+"version"+"'"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
if((data10.adapterVersion === undefined) || (!(func0.call(data10, "adapterVersion")))){
const err42 = {instancePath:instancePath+"/simulation/engine",schemaPath:"#/$defs/simulation/properties/engine/required",keyword:"required",params:{missingProperty: "adapterVersion"},message:"must have required property '"+"adapterVersion"+"'"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
if((data10.profile === undefined) || (!(func0.call(data10, "profile")))){
const err43 = {instancePath:instancePath+"/simulation/engine",schemaPath:"#/$defs/simulation/properties/engine/required",keyword:"required",params:{missingProperty: "profile"},message:"must have required property '"+"profile"+"'"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
for(const key4 of Object.keys(data10)){
if(!((((key4 === "name") || (key4 === "version")) || (key4 === "adapterVersion")) || (key4 === "profile"))){
const err44 = {instancePath:instancePath+"/simulation/engine",schemaPath:"#/$defs/simulation/properties/engine/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
if(data10.name !== undefined && func0.call(data10, "name")){
let data11 = data10.name;
if(!((data11 === "matter-js") || (data11 === "planck"))){
const err45 = {instancePath:instancePath+"/simulation/engine/name",schemaPath:"#/$defs/simulation/properties/engine/properties/name/enum",keyword:"enum",params:{allowedValues: schema37.properties.engine.properties.name.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
if(data10.version !== undefined && func0.call(data10, "version")){
let data12 = data10.version;
if(typeof data12 === "string"){
if(func92(data12) > 40){
const err46 = {instancePath:instancePath+"/simulation/engine/version",schemaPath:"#/$defs/simulation/properties/engine/properties/version/maxLength",keyword:"maxLength",params:{limit: 40},message:"must NOT have more than 40 characters"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
if(!pattern4.test(data12)){
const err47 = {instancePath:instancePath+"/simulation/engine/version",schemaPath:"#/$defs/simulation/properties/engine/properties/version/pattern",keyword:"pattern",params:{pattern: "^\\d+\\.\\d+\\.\\d+$"},message:"must match pattern \""+"^\\d+\\.\\d+\\.\\d+$"+"\""};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
else {
const err48 = {instancePath:instancePath+"/simulation/engine/version",schemaPath:"#/$defs/simulation/properties/engine/properties/version/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
if(data10.adapterVersion !== undefined && func0.call(data10, "adapterVersion")){
let data13 = data10.adapterVersion;
if(typeof data13 === "string"){
if(func92(data13) > 40){
const err49 = {instancePath:instancePath+"/simulation/engine/adapterVersion",schemaPath:"#/$defs/simulation/properties/engine/properties/adapterVersion/maxLength",keyword:"maxLength",params:{limit: 40},message:"must NOT have more than 40 characters"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
if(!pattern4.test(data13)){
const err50 = {instancePath:instancePath+"/simulation/engine/adapterVersion",schemaPath:"#/$defs/simulation/properties/engine/properties/adapterVersion/pattern",keyword:"pattern",params:{pattern: "^\\d+\\.\\d+\\.\\d+$"},message:"must match pattern \""+"^\\d+\\.\\d+\\.\\d+$"+"\""};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
else {
const err51 = {instancePath:instancePath+"/simulation/engine/adapterVersion",schemaPath:"#/$defs/simulation/properties/engine/properties/adapterVersion/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
if(data10.profile !== undefined && func0.call(data10, "profile")){
let data14 = data10.profile;
if(typeof data14 === "string"){
if(!pattern6.test(data14)){
const err52 = {instancePath:instancePath+"/simulation/engine/profile",schemaPath:"#/$defs/simulation/properties/engine/properties/profile/pattern",keyword:"pattern",params:{pattern: "^[a-z0-9][a-z0-9.-]{0,79}$"},message:"must match pattern \""+"^[a-z0-9][a-z0-9.-]{0,79}$"+"\""};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
}
else {
const err53 = {instancePath:instancePath+"/simulation/engine/profile",schemaPath:"#/$defs/simulation/properties/engine/properties/profile/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
}
}
else {
const err54 = {instancePath:instancePath+"/simulation/engine",schemaPath:"#/$defs/simulation/properties/engine/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
if(data9.timestepSeconds !== undefined && func0.call(data9, "timestepSeconds")){
let data15 = data9.timestepSeconds;
if(!(((data15 === 0.016666666666666666) || (data15 === 0.008333333333333333)) || (data15 === 0.004166666666666667))){
const err55 = {instancePath:instancePath+"/simulation/timestepSeconds",schemaPath:"#/$defs/simulation/properties/timestepSeconds/enum",keyword:"enum",params:{allowedValues: schema37.properties.timestepSeconds.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
}
if(data9.substeps !== undefined && func0.call(data9, "substeps")){
let data16 = data9.substeps;
if(!(((typeof data16 == "number") && (!(data16 % 1) && !isNaN(data16))) && (isFinite(data16)))){
const err56 = {instancePath:instancePath+"/simulation/substeps",schemaPath:"#/$defs/simulation/properties/substeps/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
if((typeof data16 == "number") && (isFinite(data16))){
if(data16 > 16 || isNaN(data16)){
const err57 = {instancePath:instancePath+"/simulation/substeps",schemaPath:"#/$defs/simulation/properties/substeps/maximum",keyword:"maximum",params:{comparison: "<=", limit: 16},message:"must be <= 16"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
if(data16 < 1 || isNaN(data16)){
const err58 = {instancePath:instancePath+"/simulation/substeps",schemaPath:"#/$defs/simulation/properties/substeps/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
}
}
if(data9.solverIterations !== undefined && func0.call(data9, "solverIterations")){
let data17 = data9.solverIterations;
if(data17 && typeof data17 == "object" && !Array.isArray(data17)){
if((data17.position === undefined) || (!(func0.call(data17, "position")))){
const err59 = {instancePath:instancePath+"/simulation/solverIterations",schemaPath:"#/$defs/simulation/properties/solverIterations/required",keyword:"required",params:{missingProperty: "position"},message:"must have required property '"+"position"+"'"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
if((data17.velocity === undefined) || (!(func0.call(data17, "velocity")))){
const err60 = {instancePath:instancePath+"/simulation/solverIterations",schemaPath:"#/$defs/simulation/properties/solverIterations/required",keyword:"required",params:{missingProperty: "velocity"},message:"must have required property '"+"velocity"+"'"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
if((data17.constraint === undefined) || (!(func0.call(data17, "constraint")))){
const err61 = {instancePath:instancePath+"/simulation/solverIterations",schemaPath:"#/$defs/simulation/properties/solverIterations/required",keyword:"required",params:{missingProperty: "constraint"},message:"must have required property '"+"constraint"+"'"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
for(const key5 of Object.keys(data17)){
if(!(((key5 === "position") || (key5 === "velocity")) || (key5 === "constraint"))){
const err62 = {instancePath:instancePath+"/simulation/solverIterations",schemaPath:"#/$defs/simulation/properties/solverIterations/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
if(data17.position !== undefined && func0.call(data17, "position")){
let data18 = data17.position;
if(!(((typeof data18 == "number") && (!(data18 % 1) && !isNaN(data18))) && (isFinite(data18)))){
const err63 = {instancePath:instancePath+"/simulation/solverIterations/position",schemaPath:"#/$defs/simulation/properties/solverIterations/properties/position/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
if((typeof data18 == "number") && (isFinite(data18))){
if(data18 > 100 || isNaN(data18)){
const err64 = {instancePath:instancePath+"/simulation/solverIterations/position",schemaPath:"#/$defs/simulation/properties/solverIterations/properties/position/maximum",keyword:"maximum",params:{comparison: "<=", limit: 100},message:"must be <= 100"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
if(data18 < 1 || isNaN(data18)){
const err65 = {instancePath:instancePath+"/simulation/solverIterations/position",schemaPath:"#/$defs/simulation/properties/solverIterations/properties/position/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
}
if(data17.velocity !== undefined && func0.call(data17, "velocity")){
let data19 = data17.velocity;
if(!(((typeof data19 == "number") && (!(data19 % 1) && !isNaN(data19))) && (isFinite(data19)))){
const err66 = {instancePath:instancePath+"/simulation/solverIterations/velocity",schemaPath:"#/$defs/simulation/properties/solverIterations/properties/velocity/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
if((typeof data19 == "number") && (isFinite(data19))){
if(data19 > 100 || isNaN(data19)){
const err67 = {instancePath:instancePath+"/simulation/solverIterations/velocity",schemaPath:"#/$defs/simulation/properties/solverIterations/properties/velocity/maximum",keyword:"maximum",params:{comparison: "<=", limit: 100},message:"must be <= 100"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
if(data19 < 1 || isNaN(data19)){
const err68 = {instancePath:instancePath+"/simulation/solverIterations/velocity",schemaPath:"#/$defs/simulation/properties/solverIterations/properties/velocity/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
}
}
if(data17.constraint !== undefined && func0.call(data17, "constraint")){
let data20 = data17.constraint;
if(!(((typeof data20 == "number") && (!(data20 % 1) && !isNaN(data20))) && (isFinite(data20)))){
const err69 = {instancePath:instancePath+"/simulation/solverIterations/constraint",schemaPath:"#/$defs/simulation/properties/solverIterations/properties/constraint/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
if((typeof data20 == "number") && (isFinite(data20))){
if(data20 > 100 || isNaN(data20)){
const err70 = {instancePath:instancePath+"/simulation/solverIterations/constraint",schemaPath:"#/$defs/simulation/properties/solverIterations/properties/constraint/maximum",keyword:"maximum",params:{comparison: "<=", limit: 100},message:"must be <= 100"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
if(data20 < 1 || isNaN(data20)){
const err71 = {instancePath:instancePath+"/simulation/solverIterations/constraint",schemaPath:"#/$defs/simulation/properties/solverIterations/properties/constraint/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
}
}
else {
const err72 = {instancePath:instancePath+"/simulation/solverIterations",schemaPath:"#/$defs/simulation/properties/solverIterations/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
}
if(data9.sleeping !== undefined && func0.call(data9, "sleeping")){
if(false !== data9.sleeping){
const err73 = {instancePath:instancePath+"/simulation/sleeping",schemaPath:"#/$defs/simulation/properties/sleeping/const",keyword:"const",params:{allowedValue: false},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
}
if(data9.seed !== undefined && func0.call(data9, "seed")){
let data22 = data9.seed;
if(!(((typeof data22 == "number") && (!(data22 % 1) && !isNaN(data22))) && (isFinite(data22)))){
const err74 = {instancePath:instancePath+"/simulation/seed",schemaPath:"#/$defs/simulation/properties/seed/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
if((typeof data22 == "number") && (isFinite(data22))){
if(data22 > 4294967295 || isNaN(data22)){
const err75 = {instancePath:instancePath+"/simulation/seed",schemaPath:"#/$defs/simulation/properties/seed/maximum",keyword:"maximum",params:{comparison: "<=", limit: 4294967295},message:"must be <= 4294967295"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
if(data22 < 0 || isNaN(data22)){
const err76 = {instancePath:instancePath+"/simulation/seed",schemaPath:"#/$defs/simulation/properties/seed/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
}
}
}
else {
const err77 = {instancePath:instancePath+"/simulation",schemaPath:"#/$defs/simulation/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
}
if(data.bodies !== undefined && func0.call(data, "bodies")){
let data23 = data.bodies;
if(Array.isArray(data23)){
if(data23.length > 100){
const err78 = {instancePath:instancePath+"/bodies",schemaPath:"#/properties/bodies/maxItems",keyword:"maxItems",params:{limit: 100},message:"must NOT have more than 100 items"};
if(vErrors === null){
vErrors = [err78];
}
else {
vErrors.push(err78);
}
errors++;
}
if(data23.length < 0){
const err79 = {instancePath:instancePath+"/bodies",schemaPath:"#/properties/bodies/minItems",keyword:"minItems",params:{limit: 0},message:"must NOT have fewer than 0 items"};
if(vErrors === null){
vErrors = [err79];
}
else {
vErrors.push(err79);
}
errors++;
}
const len0 = data23.length;
for(let i0=0; i0<len0; i0++){
if(!(validate23(data23[i0], {instancePath:instancePath+"/bodies/" + i0,parentData:data23,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate23.errors : vErrors.concat(validate23.errors);
errors = vErrors.length;
}
}
}
else {
const err80 = {instancePath:instancePath+"/bodies",schemaPath:"#/properties/bodies/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err80];
}
else {
vErrors.push(err80);
}
errors++;
}
}
if(data.constraints !== undefined && func0.call(data, "constraints")){
let data25 = data.constraints;
if(Array.isArray(data25)){
if(data25.length > 100){
const err81 = {instancePath:instancePath+"/constraints",schemaPath:"#/properties/constraints/maxItems",keyword:"maxItems",params:{limit: 100},message:"must NOT have more than 100 items"};
if(vErrors === null){
vErrors = [err81];
}
else {
vErrors.push(err81);
}
errors++;
}
if(data25.length < 0){
const err82 = {instancePath:instancePath+"/constraints",schemaPath:"#/properties/constraints/minItems",keyword:"minItems",params:{limit: 0},message:"must NOT have fewer than 0 items"};
if(vErrors === null){
vErrors = [err82];
}
else {
vErrors.push(err82);
}
errors++;
}
const len1 = data25.length;
for(let i1=0; i1<len1; i1++){
if(!(validate27(data25[i1], {instancePath:instancePath+"/constraints/" + i1,parentData:data25,parentDataProperty:i1,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
errors = vErrors.length;
}
}
}
else {
const err83 = {instancePath:instancePath+"/constraints",schemaPath:"#/properties/constraints/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err83];
}
else {
vErrors.push(err83);
}
errors++;
}
}
if(data.forces !== undefined && func0.call(data, "forces")){
let data27 = data.forces;
if(Array.isArray(data27)){
if(data27.length > 200){
const err84 = {instancePath:instancePath+"/forces",schemaPath:"#/properties/forces/maxItems",keyword:"maxItems",params:{limit: 200},message:"must NOT have more than 200 items"};
if(vErrors === null){
vErrors = [err84];
}
else {
vErrors.push(err84);
}
errors++;
}
if(data27.length < 0){
const err85 = {instancePath:instancePath+"/forces",schemaPath:"#/properties/forces/minItems",keyword:"minItems",params:{limit: 0},message:"must NOT have fewer than 0 items"};
if(vErrors === null){
vErrors = [err85];
}
else {
vErrors.push(err85);
}
errors++;
}
const len2 = data27.length;
for(let i2=0; i2<len2; i2++){
if(!(validate38(data27[i2], {instancePath:instancePath+"/forces/" + i2,parentData:data27,parentDataProperty:i2,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate38.errors : vErrors.concat(validate38.errors);
errors = vErrors.length;
}
}
}
else {
const err86 = {instancePath:instancePath+"/forces",schemaPath:"#/properties/forces/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err86];
}
else {
vErrors.push(err86);
}
errors++;
}
}
if(data.measurements !== undefined && func0.call(data, "measurements")){
let data29 = data.measurements;
if(Array.isArray(data29)){
if(data29.length > 20){
const err87 = {instancePath:instancePath+"/measurements",schemaPath:"#/properties/measurements/maxItems",keyword:"maxItems",params:{limit: 20},message:"must NOT have more than 20 items"};
if(vErrors === null){
vErrors = [err87];
}
else {
vErrors.push(err87);
}
errors++;
}
if(data29.length < 0){
const err88 = {instancePath:instancePath+"/measurements",schemaPath:"#/properties/measurements/minItems",keyword:"minItems",params:{limit: 0},message:"must NOT have fewer than 0 items"};
if(vErrors === null){
vErrors = [err88];
}
else {
vErrors.push(err88);
}
errors++;
}
const len3 = data29.length;
for(let i3=0; i3<len3; i3++){
if(!(validate40(data29[i3], {instancePath:instancePath+"/measurements/" + i3,parentData:data29,parentDataProperty:i3,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate40.errors : vErrors.concat(validate40.errors);
errors = vErrors.length;
}
}
}
else {
const err89 = {instancePath:instancePath+"/measurements",schemaPath:"#/properties/measurements/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err89];
}
else {
vErrors.push(err89);
}
errors++;
}
}
if(data.studentPolicy !== undefined && func0.call(data, "studentPolicy")){
let data31 = data.studentPolicy;
if(data31 && typeof data31 == "object" && !Array.isArray(data31)){
if((data31.controls === undefined) || (!(func0.call(data31, "controls")))){
const err90 = {instancePath:instancePath+"/studentPolicy",schemaPath:"#/properties/studentPolicy/required",keyword:"required",params:{missingProperty: "controls"},message:"must have required property '"+"controls"+"'"};
if(vErrors === null){
vErrors = [err90];
}
else {
vErrors.push(err90);
}
errors++;
}
for(const key6 of Object.keys(data31)){
if(!(key6 === "controls")){
const err91 = {instancePath:instancePath+"/studentPolicy",schemaPath:"#/properties/studentPolicy/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key6},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err91];
}
else {
vErrors.push(err91);
}
errors++;
}
}
if(data31.controls !== undefined && func0.call(data31, "controls")){
let data32 = data31.controls;
if(Array.isArray(data32)){
if(data32.length > 50){
const err92 = {instancePath:instancePath+"/studentPolicy/controls",schemaPath:"#/properties/studentPolicy/properties/controls/maxItems",keyword:"maxItems",params:{limit: 50},message:"must NOT have more than 50 items"};
if(vErrors === null){
vErrors = [err92];
}
else {
vErrors.push(err92);
}
errors++;
}
if(data32.length < 0){
const err93 = {instancePath:instancePath+"/studentPolicy/controls",schemaPath:"#/properties/studentPolicy/properties/controls/minItems",keyword:"minItems",params:{limit: 0},message:"must NOT have fewer than 0 items"};
if(vErrors === null){
vErrors = [err93];
}
else {
vErrors.push(err93);
}
errors++;
}
const len4 = data32.length;
for(let i4=0; i4<len4; i4++){
if(!(validate42(data32[i4], {instancePath:instancePath+"/studentPolicy/controls/" + i4,parentData:data32,parentDataProperty:i4,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate42.errors : vErrors.concat(validate42.errors);
errors = vErrors.length;
}
}
}
else {
const err94 = {instancePath:instancePath+"/studentPolicy/controls",schemaPath:"#/properties/studentPolicy/properties/controls/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err94];
}
else {
vErrors.push(err94);
}
errors++;
}
}
}
else {
const err95 = {instancePath:instancePath+"/studentPolicy",schemaPath:"#/properties/studentPolicy/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err95];
}
else {
vErrors.push(err95);
}
errors++;
}
}
if(data.view !== undefined && func0.call(data, "view")){
let data34 = data.view;
if(data34 && typeof data34 == "object" && !Array.isArray(data34)){
if((data34.cameraCenter === undefined) || (!(func0.call(data34, "cameraCenter")))){
const err96 = {instancePath:instancePath+"/view",schemaPath:"#/properties/view/required",keyword:"required",params:{missingProperty: "cameraCenter"},message:"must have required property '"+"cameraCenter"+"'"};
if(vErrors === null){
vErrors = [err96];
}
else {
vErrors.push(err96);
}
errors++;
}
if((data34.pixelsPerMeter === undefined) || (!(func0.call(data34, "pixelsPerMeter")))){
const err97 = {instancePath:instancePath+"/view",schemaPath:"#/properties/view/required",keyword:"required",params:{missingProperty: "pixelsPerMeter"},message:"must have required property '"+"pixelsPerMeter"+"'"};
if(vErrors === null){
vErrors = [err97];
}
else {
vErrors.push(err97);
}
errors++;
}
if((data34.vectors === undefined) || (!(func0.call(data34, "vectors")))){
const err98 = {instancePath:instancePath+"/view",schemaPath:"#/properties/view/required",keyword:"required",params:{missingProperty: "vectors"},message:"must have required property '"+"vectors"+"'"};
if(vErrors === null){
vErrors = [err98];
}
else {
vErrors.push(err98);
}
errors++;
}
for(const key7 of Object.keys(data34)){
if(!(((key7 === "cameraCenter") || (key7 === "pixelsPerMeter")) || (key7 === "vectors"))){
const err99 = {instancePath:instancePath+"/view",schemaPath:"#/properties/view/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key7},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err99];
}
else {
vErrors.push(err99);
}
errors++;
}
}
if(data34.cameraCenter !== undefined && func0.call(data34, "cameraCenter")){
let data35 = data34.cameraCenter;
if(data35 && typeof data35 == "object" && !Array.isArray(data35)){
if((data35.x === undefined) || (!(func0.call(data35, "x")))){
const err100 = {instancePath:instancePath+"/view/cameraCenter",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "x"},message:"must have required property '"+"x"+"'"};
if(vErrors === null){
vErrors = [err100];
}
else {
vErrors.push(err100);
}
errors++;
}
if((data35.y === undefined) || (!(func0.call(data35, "y")))){
const err101 = {instancePath:instancePath+"/view/cameraCenter",schemaPath:"#/$defs/vector/required",keyword:"required",params:{missingProperty: "y"},message:"must have required property '"+"y"+"'"};
if(vErrors === null){
vErrors = [err101];
}
else {
vErrors.push(err101);
}
errors++;
}
for(const key8 of Object.keys(data35)){
if(!((key8 === "x") || (key8 === "y"))){
const err102 = {instancePath:instancePath+"/view/cameraCenter",schemaPath:"#/$defs/vector/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key8},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err102];
}
else {
vErrors.push(err102);
}
errors++;
}
}
if(data35.x !== undefined && func0.call(data35, "x")){
let data36 = data35.x;
if((typeof data36 == "number") && (isFinite(data36))){
if(data36 > 1000000 || isNaN(data36)){
const err103 = {instancePath:instancePath+"/view/cameraCenter/x",schemaPath:"#/$defs/vector/properties/x/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err103];
}
else {
vErrors.push(err103);
}
errors++;
}
if(data36 < -1000000 || isNaN(data36)){
const err104 = {instancePath:instancePath+"/view/cameraCenter/x",schemaPath:"#/$defs/vector/properties/x/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err104];
}
else {
vErrors.push(err104);
}
errors++;
}
}
else {
const err105 = {instancePath:instancePath+"/view/cameraCenter/x",schemaPath:"#/$defs/vector/properties/x/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err105];
}
else {
vErrors.push(err105);
}
errors++;
}
}
if(data35.y !== undefined && func0.call(data35, "y")){
let data37 = data35.y;
if((typeof data37 == "number") && (isFinite(data37))){
if(data37 > 1000000 || isNaN(data37)){
const err106 = {instancePath:instancePath+"/view/cameraCenter/y",schemaPath:"#/$defs/vector/properties/y/maximum",keyword:"maximum",params:{comparison: "<=", limit: 1000000},message:"must be <= 1000000"};
if(vErrors === null){
vErrors = [err106];
}
else {
vErrors.push(err106);
}
errors++;
}
if(data37 < -1000000 || isNaN(data37)){
const err107 = {instancePath:instancePath+"/view/cameraCenter/y",schemaPath:"#/$defs/vector/properties/y/minimum",keyword:"minimum",params:{comparison: ">=", limit: -1000000},message:"must be >= -1000000"};
if(vErrors === null){
vErrors = [err107];
}
else {
vErrors.push(err107);
}
errors++;
}
}
else {
const err108 = {instancePath:instancePath+"/view/cameraCenter/y",schemaPath:"#/$defs/vector/properties/y/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err108];
}
else {
vErrors.push(err108);
}
errors++;
}
}
}
else {
const err109 = {instancePath:instancePath+"/view/cameraCenter",schemaPath:"#/$defs/vector/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err109];
}
else {
vErrors.push(err109);
}
errors++;
}
}
if(data34.pixelsPerMeter !== undefined && func0.call(data34, "pixelsPerMeter")){
let data38 = data34.pixelsPerMeter;
if((typeof data38 == "number") && (isFinite(data38))){
if(data38 > 2000 || isNaN(data38)){
const err110 = {instancePath:instancePath+"/view/pixelsPerMeter",schemaPath:"#/properties/view/properties/pixelsPerMeter/maximum",keyword:"maximum",params:{comparison: "<=", limit: 2000},message:"must be <= 2000"};
if(vErrors === null){
vErrors = [err110];
}
else {
vErrors.push(err110);
}
errors++;
}
if(data38 < 1 || isNaN(data38)){
const err111 = {instancePath:instancePath+"/view/pixelsPerMeter",schemaPath:"#/properties/view/properties/pixelsPerMeter/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err111];
}
else {
vErrors.push(err111);
}
errors++;
}
}
else {
const err112 = {instancePath:instancePath+"/view/pixelsPerMeter",schemaPath:"#/properties/view/properties/pixelsPerMeter/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err112];
}
else {
vErrors.push(err112);
}
errors++;
}
}
if(data34.vectors !== undefined && func0.call(data34, "vectors")){
let data39 = data34.vectors;
if(data39 && typeof data39 == "object" && !Array.isArray(data39)){
if((data39.velocity === undefined) || (!(func0.call(data39, "velocity")))){
const err113 = {instancePath:instancePath+"/view/vectors",schemaPath:"#/properties/view/properties/vectors/required",keyword:"required",params:{missingProperty: "velocity"},message:"must have required property '"+"velocity"+"'"};
if(vErrors === null){
vErrors = [err113];
}
else {
vErrors.push(err113);
}
errors++;
}
if((data39.acceleration === undefined) || (!(func0.call(data39, "acceleration")))){
const err114 = {instancePath:instancePath+"/view/vectors",schemaPath:"#/properties/view/properties/vectors/required",keyword:"required",params:{missingProperty: "acceleration"},message:"must have required property '"+"acceleration"+"'"};
if(vErrors === null){
vErrors = [err114];
}
else {
vErrors.push(err114);
}
errors++;
}
if((data39.appliedForce === undefined) || (!(func0.call(data39, "appliedForce")))){
const err115 = {instancePath:instancePath+"/view/vectors",schemaPath:"#/properties/view/properties/vectors/required",keyword:"required",params:{missingProperty: "appliedForce"},message:"must have required property '"+"appliedForce"+"'"};
if(vErrors === null){
vErrors = [err115];
}
else {
vErrors.push(err115);
}
errors++;
}
for(const key9 of Object.keys(data39)){
if(!(((key9 === "velocity") || (key9 === "acceleration")) || (key9 === "appliedForce"))){
const err116 = {instancePath:instancePath+"/view/vectors",schemaPath:"#/properties/view/properties/vectors/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key9},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err116];
}
else {
vErrors.push(err116);
}
errors++;
}
}
if(data39.velocity !== undefined && func0.call(data39, "velocity")){
if(typeof data39.velocity !== "boolean"){
const err117 = {instancePath:instancePath+"/view/vectors/velocity",schemaPath:"#/properties/view/properties/vectors/properties/velocity/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err117];
}
else {
vErrors.push(err117);
}
errors++;
}
}
if(data39.acceleration !== undefined && func0.call(data39, "acceleration")){
if(typeof data39.acceleration !== "boolean"){
const err118 = {instancePath:instancePath+"/view/vectors/acceleration",schemaPath:"#/properties/view/properties/vectors/properties/acceleration/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err118];
}
else {
vErrors.push(err118);
}
errors++;
}
}
if(data39.appliedForce !== undefined && func0.call(data39, "appliedForce")){
if(typeof data39.appliedForce !== "boolean"){
const err119 = {instancePath:instancePath+"/view/vectors/appliedForce",schemaPath:"#/properties/view/properties/vectors/properties/appliedForce/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err119];
}
else {
vErrors.push(err119);
}
errors++;
}
}
}
else {
const err120 = {instancePath:instancePath+"/view/vectors",schemaPath:"#/properties/view/properties/vectors/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err120];
}
else {
vErrors.push(err120);
}
errors++;
}
}
}
else {
const err121 = {instancePath:instancePath+"/view",schemaPath:"#/properties/view/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err121];
}
else {
vErrors.push(err121);
}
errors++;
}
}
}
else {
const err122 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err122];
}
else {
vErrors.push(err122);
}
errors++;
}
validate20.errors = vErrors;
return errors === 0;
}
validate20.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

