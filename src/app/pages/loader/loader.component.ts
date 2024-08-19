import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  viewChild,
} from '@angular/core';
import {
  EquirectangularReflectionMapping,
  HalfFloatType,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SpotLight,
  SpotLightHelper,
  Vector3,
  WebGLRenderer
} from 'three';
import {
  GLTFLoader,
  OrbitControls,
  UltraHDRLoader
} from 'three/examples/jsm/Addons.js';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
class LoaderComponent implements OnInit {
  private _scene!: Scene;
  private _camera!: PerspectiveCamera;
  private _controls!: OrbitControls;
  private _renderer!: WebGLRenderer;

  private _threeEl = viewChild.required('three', { read: ElementRef });

  loadingProgress = 0

  ngOnInit(): void {
    this._init();
  }

  private _start(): void {
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
      1000
    );
    _camera.position.set(0, 8, -10);

    const _renderer = new WebGLRenderer({ antialias: true });
    _renderer.shadowMap.enabled = true;
    _renderer.shadowMap.type = PCFSoftShadowMap;    
    _renderer.setPixelRatio(window.devicePixelRatio);

    return { _scene, _camera, _renderer };
  }

  private _addLights(scene: Scene) {    

    const spotLight = new SpotLight(0xffffff, 200);
    spotLight.position.set(-3, 10, 4);
    spotLight.lookAt(0, 0, 0);
    spotLight.castShadow = true;
    spotLight.penumbra = 1

    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.mapSize.width = 2048;
    
    const spotLightHelper = new SpotLightHelper( spotLight );
    scene.add( spotLightHelper );

    scene.add(spotLight);
  }

  private _buildScene(scene: Scene) {
    const pG = new PlaneGeometry(30, 30);
    const mG = new MeshStandardMaterial({
      color: 0xbcbcbc,
      roughness: 0.6,
      metalness: 0,
    });
    const plane = new Mesh(pG, mG);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;

    scene.add(plane);
  }


  private  _loadMesh(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer) {
    const loader = new GLTFLoader()

    loader.setPath('models/')

    loader.load('test.glb', async (gltf)=>{
      const model = gltf.scene

      await renderer.compileAsync(model, camera, scene)
      model.scale.set(2,2,2)
      model.rotation.y = Math.PI

      model.traverse(child => {
        if ((child as Mesh).isMesh) {
          const mesh = child as Mesh
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })
      scene.add(model)

      this._start()

      const hdrLoader = new UltraHDRLoader()
      hdrLoader.setDataType(HalfFloatType)
      hdrLoader.setPath('env/')

      hdrLoader.load('studio_small_08_2k.jpg', (texture) => {

        texture.mapping = EquirectangularReflectionMapping

        scene.environment = texture
        scene.environmentIntensity = 0.5
        scene.background = texture

        this._start()
        
      })
    },
    (progress) => {
      this.loadingProgress = Math.round((progress.loaded / progress.total) * 100)
    }
  )
  }

  private _init() {
    Object.assign(this, this._basic());

    this._addLights(this._scene);
    this._buildScene(this._scene);

    this._controls = new OrbitControls(
      this._camera,
      this._threeEl().nativeElement
    );

    this._controls.target = new Vector3(0, 4, 0);
    this._controls.update();
    this._controls.autoRotate = true;
    this._controls.autoRotateSpeed = 0.5;

    this._loadMesh(this._scene, this._camera, this._renderer)
  }

  //#edndregion

  //#region Runtime

  private _animate() {
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

export default LoaderComponent;
