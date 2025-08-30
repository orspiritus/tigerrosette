import{by as r}from"./pointsCloudSystem-2vcS-S4d.js";import"./index-rhFFGTpy.js";import"./motion-3WHHzQTP.js";import"./vendor-CIP6LD3P.js";const e="passCubePixelShader",t=`varying vec2 vUV;uniform samplerCube textureSampler;
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{vec2 uv=vUV*2.0-1.0;
#ifdef POSITIVEX
gl_FragColor=textureCube(textureSampler,vec3(1.001,uv.y,uv.x));
#endif
#ifdef NEGATIVEX
gl_FragColor=textureCube(textureSampler,vec3(-1.001,uv.y,uv.x));
#endif
#ifdef POSITIVEY
gl_FragColor=textureCube(textureSampler,vec3(uv.y,1.001,uv.x));
#endif
#ifdef NEGATIVEY
gl_FragColor=textureCube(textureSampler,vec3(uv.y,-1.001,uv.x));
#endif
#ifdef POSITIVEZ
gl_FragColor=textureCube(textureSampler,vec3(uv,1.001));
#endif
#ifdef NEGATIVEZ
gl_FragColor=textureCube(textureSampler,vec3(uv,-1.001));
#endif
}`;r.ShadersStore[e]||(r.ShadersStore[e]=t);const v={name:e,shader:t};export{v as passCubePixelShader};
//# sourceMappingURL=passCube.fragment-sEcb3B-6.js.map
