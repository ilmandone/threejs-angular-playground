import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  viewChild,
} from '@angular/core';
import {
  AmbientLight,
  DirectionalLight,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

import vertexMain from './glsl/vertex_main.glsl';
import vertexPars from './glsl/vertex_pars.glsl';
import fragmentPars from './glsl/fragment_pars.glsl'
import fragmentMain from './glsl/fragment_main.glsl'

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

@Component({
  selector: 'app-shaders',
  standalone: true,
  imports: [],
  templateUrl: './shaders.component.html',
  styleUrl: './shaders.component.scss',
})
class ShadersComponent implements OnInit {
  private _scene!: Scene;
  private _camera!: PerspectiveCamera;
  private _controls!: OrbitControls;
  private _renderer!: WebGLRenderer;

  private _threeEl = viewChild.required('three', { read: ElementRef });

  private _gui = new GUI();
  private _material!: MeshStandardMaterial;

  ngOnInit(): void {
    this._init();

    this._windowResize();
    this._renderer.setAnimationLoop(this._animate.bind(this));

    this._threeEl().nativeElement.appendChild(this._renderer.domElement);
  }

  //#region privates

  private _basic() {
    const _scene = new Scene();
    const _camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    _camera.position.z = -4;

    const _renderer = new WebGLRenderer({ antialias: true });
    _renderer.shadowMap.enabled = true;
    _renderer.shadowMap.type = PCFShadowMap;
    _renderer.setPixelRatio(window.devicePixelRatio);
    _renderer.setClearColor(0x201114);

    return { _scene, _camera, _renderer };
  }

  private _addLights(scene: Scene) {
    // lighting
    const dirLight = new DirectionalLight('#ffffff', 2);
    dirLight.position.set(5, 5, -5);
    scene.add(dirLight);

    const ambientLight = new AmbientLight('#ffffff', 0.2);
    scene.add(dirLight, ambientLight);
  }

  private _buildScene(scene: Scene): MeshStandardMaterial {
    const geometry = new IcosahedronGeometry(1, 200);
    const material = new MeshStandardMaterial({color: 0x2210FE})

    material.onBeforeCompile = (shader) => {
      // storing a reference to the shader object
      material.userData['shader'] = shader
  
      // uniforms
      shader.uniforms['uTime'] = { value: 0 }

      const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + vertexPars
      )

      const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + vertexMain
      )

      const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`
      const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`
      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + fragmentPars
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + fragmentMain
      )
    }

    const ico = new Mesh(geometry, material);
    ico.rotation.y = -Math.PI;
    scene.add(ico);

    return  material;
  }

  private _init() {
    Object.assign(this, this._basic());

    this._addLights(this._scene);
    this._material = this._buildScene(this._scene);

    this._controls = new OrbitControls(
      this._camera,
      this._threeEl().nativeElement
    );

    // GUI
    // this._gui.add(this._material.uniforms['uRadius'], "value").min(0).max(1).step(0.01);
  }

  //#edndregion

  //#region Runtime

  private _animate() {
    if(this._material.userData['shader'])
    this._material.userData['shader'].uniforms['uTime'].value += 0.002;

    this._controls.update();
    this._renderer.render(this._scene, this._camera);
  }

  @HostListener('window:resize', ['$event'])
  private _windowResize() {
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
  }

  //#endregion
}

export default ShadersComponent;
