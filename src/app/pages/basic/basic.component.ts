import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  viewChild,
} from '@angular/core';
import {
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  RectAreaLight,
  Scene,
  TorusKnotGeometry,
  Vector3,
  WebGLRenderer
} from 'three';
import {
  OrbitControls,
  RectAreaLightHelper,
  RectAreaLightUniformsLib,
} from 'three/examples/jsm/Addons.js';

@Component({
  selector: 'app-basic',
  standalone: true,
  imports: [],
  templateUrl: './basic.component.html',
  styleUrl: './basic.component.scss',
})
class BasicComponent implements OnInit {
  private _scene!: Scene;
  private _camera!: PerspectiveCamera;
  private _controls!: OrbitControls;
  private _renderer!: WebGLRenderer;
  private _knot!: Mesh;

  private _threeEl = viewChild.required('three', { read: ElementRef });

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
      1000
    );
    _camera.position.set(0, 8, -10);

    const _renderer = new WebGLRenderer({ antialias: true });
    _renderer.shadowMap.enabled = true;
    _renderer.shadowMap.type = PCFShadowMap;
    _renderer.setPixelRatio(window.devicePixelRatio);

    return { _scene, _camera, _renderer };
  }

  private _addLights(scene: Scene) {
    RectAreaLightUniformsLib.init();

    const rectLight1 = new RectAreaLight(0xff0000, 3, 5, 8);
    rectLight1.position.set(-5, 4, 0);
    rectLight1.rotation.y = -Math.PI / 2;
    scene.add(rectLight1);

    const rectLight2 = new RectAreaLight(0x00ff00, 3, 5, 8);
    rectLight2.position.set(0, 4, 5);
    scene.add(rectLight2);

    const rectLight3 = new RectAreaLight(0x0000ff, 3, 5, 8);
    rectLight3.position.set(5, 4, 0);
    rectLight3.rotation.y = Math.PI / 2;

    scene.add(rectLight3);

    const spotLight = new DirectionalLight(0xffffff, 1);
    spotLight.position.set(0, 7, 2);
    spotLight.lookAt(0, 0, 0);
    spotLight.castShadow = true;

    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.mapSize.width = 1024;

    scene.add(spotLight);

    scene.add(new RectAreaLightHelper(rectLight1));
    scene.add(new RectAreaLightHelper(rectLight2));
    scene.add(new RectAreaLightHelper(rectLight3));
  }

  private _buildScene(scene: Scene): Mesh {
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

    const geometry = new TorusKnotGeometry(1.5, 0.75, 90, 32);
    const material = new MeshStandardMaterial({
      color: 0x99ffaa,
      roughness: 0.02,
      metalness: 0,
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.y = 3;
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    scene.add(mesh);

    return mesh;
  }

  private _init() {
    Object.assign(this, this._basic());

    this._addLights(this._scene);

    this._knot = this._buildScene(this._scene);

    this._controls = new OrbitControls(
      this._camera,
      this._threeEl().nativeElement
    );

    this._controls.target = new Vector3(0, 4, 0);
    this._controls.update();
    this._controls.autoRotate = true;
    this._controls.autoRotateSpeed = 0.5;
  }

  //#edndregion

  //#region Runtime

  private _animate() {
    this._knot.rotation.y += 0.01;
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

export default BasicComponent;
