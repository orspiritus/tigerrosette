import{by as r}from"./pointsCloudSystem-2vcS-S4d.js";import"./helperFunctions-Dt8Ez0m5.js";import"./index-rhFFGTpy.js";import"./motion-3WHHzQTP.js";import"./vendor-CIP6LD3P.js";const e="rgbdEncodePixelShader",t=`varying vUV: vec2f;var textureSamplerSampler: sampler;var textureSampler: texture_2d<f32>;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=toRGBD(textureSample(textureSampler,textureSamplerSampler,input.vUV).rgb);}`;r.ShadersStoreWGSL[e]||(r.ShadersStoreWGSL[e]=t);const o={name:e,shader:t};export{o as rgbdEncodePixelShaderWGSL};
//# sourceMappingURL=rgbdEncode.fragment-CC1-xNHs.js.map
