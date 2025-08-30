import{by as r}from"./pointsCloudSystem-2vcS-S4d.js";import"./index-rhFFGTpy.js";import"./motion-3WHHzQTP.js";import"./vendor-CIP6LD3P.js";const e="rgbdEncodePixelShader",o=`varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=toRGBD(texture2D(textureSampler,vUV).rgb);}`;r.ShadersStore[e]||(r.ShadersStore[e]=o);const n={name:e,shader:o};export{n as rgbdEncodePixelShader};
//# sourceMappingURL=rgbdEncode.fragment-C5jKXevo.js.map
