import{by as t}from"./pointsCloudSystem-2vcS-S4d.js";import"./index-rhFFGTpy.js";import"./motion-3WHHzQTP.js";import"./vendor-CIP6LD3P.js";const e="postprocessVertexShader",r=`attribute position: vec2<f32>;uniform scale: vec2<f32>;varying vUV: vec2<f32>;const madd=vec2(0.5,0.5);
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {
#define CUSTOM_VERTEX_MAIN_BEGIN
vertexOutputs.vUV=(vertexInputs.position*madd+madd)*uniforms.scale;vertexOutputs.position=vec4(vertexInputs.position,0.0,1.0);
#define CUSTOM_VERTEX_MAIN_END
}
`;t.ShadersStoreWGSL[e]||(t.ShadersStoreWGSL[e]=r);const p={name:e,shader:r};export{p as postprocessVertexShaderWGSL};
//# sourceMappingURL=postprocess.vertex-DIr9NoBj.js.map
