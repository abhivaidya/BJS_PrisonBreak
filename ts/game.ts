/// <reference path = "../lib/babylon.d.ts"/>

class Game
{
    private engine: BABYLON.Engine;
    public assets: Array<BABYLON.AbstractMesh>;
    public scene: BABYLON.Scene;

    private trees: Array<BABYLON.AbstractMesh>;

    private nooftrees = 3;

    public static SELF : number = 0;
    public static CLONE : number = 1;
    public static INSTANCE : number = 2;

    public static Colours = {
        RED:"#D27575",
        GREY:"#675A55",
        BLUE:"#529B9C",
        GREEN:"#9CBA8F",
        YELLOW:"#EAC392"
    };

    private GROUND_WIDTH = 30;
    private GROUND_HEIGHT = 30;

    private shadowGenerator;

    constructor(canvasElement:string)
    {
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(canvas, true);
        this.engine.enableOfflineSupport = false;

        this.assets = [];
        this.scene = null;

        this.trees = [];

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this.initScene();
    }

    private initScene()
    {
        this.scene = new BABYLON.Scene(this.engine);
        //this.scene.clearColor = BABYLON.Color3.FromInts(0, 163, 136);
        //this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        //this.scene.fogDensity = 0.02;
        //this.scene.fogColor = new BABYLON.Color3(0.8, 0.83, 0.8);

        let camera = new BABYLON.ArcRotateCamera('ArcRotCam', -0.65, 0.65, 50, new BABYLON.Vector3(0, 0, 0), this.scene);
        camera.attachControl(this.engine.getRenderingCanvas());
        /*camera.keysUp.push(87); // "w"
	    camera.keysDown.push(83); // "s"
	    camera.keysLeft.push(65); // "a"
	    camera.keysRight.push(68); // "d"*/
        //camera.wheelPrecision *= 10;

        //let light = new BABYLON.HemisphericLight('hemisphericLight', new BABYLON.Vector3(0, 10, 0), this.scene);
        let light = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-1, -2, 1), this.scene);
        light.intensity = 1.25;
        light.specular = BABYLON.Color3.Black();
        light.position = new BABYLON.Vector3(20, 10, -20);

    	var lightSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 2, this.scene);
    	lightSphere.position = light.position;
    	lightSphere.material = new BABYLON.StandardMaterial("light", this.scene);
    	(lightSphere.material as BABYLON.StandardMaterial).emissiveColor = new BABYLON.Color3(1, 1, 0);

        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
        this.shadowGenerator.setDarkness(0.5);
        this.shadowGenerator.useBlurVarianceShadowMap = true;
        //this.shadowGenerator.bias = 0.0001;
        //this.shadowGenerator.blurScale = 2;

        let loader = new Preloader(this);
        loader.callback = this.run.bind(this);
        loader.loadAssets();
    }

    private run()
    {
        this.scene.executeWhenReady(() => {

            // Remove loader
            var loader = <HTMLElement> document.querySelector("#splashscreen");
            loader.style.display = "none";

            this._init();

            this.engine.runRenderLoop(() => {
                this.scene.render();
            });

            this._runGame();
        });
    }

    private _init ()
    {
        this.scene.debugLayer.show();
        this.showAxis(15);
        this.prepWorld();
    }

    private prepWorld(assetToUse:Array<BABYLON.Mesh> = null)
    {
        let ground = BABYLON.MeshBuilder.CreateBox("ground", {width: this.GROUND_WIDTH, height:0.5, depth:this.GROUND_HEIGHT}, this.scene);
        ground.position.y = -0.25;
        ground.receiveShadows = true;

        let map : number[][] = [
            [0, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, -1, -1, -1, -1, -1, -1, -1, 0],
            [0, -1, -1, -1, -1, 2, -1, -1, 0],
            [0, -1, -1, -1, -1, -1, -1, -1, 0],
            [0, -1, -1, -1, 2, -1, -1, -1, 0],
            [0, -1, -1, -1, -1, -1, -1, -1, 0],
            [0, -1, -1, -1, -1, -1, -1, -1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0]
        ];

        for(let i = 0; i < map.length; i++)
        {
            for(let j = 0; j < map[i].length; j++)
            {
                let asset;

                if(map[i][j] == 0 || map[i][j] == 1)
                {
                    asset = this.createAsset("Mesh1 " + "Grey_Border_Wall" + " Model", Game.INSTANCE);
                    asset.position.x = i * 3 - 12;

                    if(map[i][j] == 0)
                    {
                        asset.rotation.y = Math.PI / 2;
                        asset.position.z = j * 3 - 12;
                    }
                    else if(map[i][j] == 1)
                    {
                        asset.position.x = i * 3 - 12;
                        asset.position.z = j * 3 - 15;
                    }
                }

                if(map[i][j] == 2)
                {
                    asset = this.createAsset("Mesh1 Tree Model", Game.INSTANCE);
                    asset.position.x = i * 3 - 12;
                    asset.position.y = 0.5;
                    asset.position.z = j * 3 - 12;
                }

                asset.receiveShadows = true;

                this.shadowGenerator.getShadowMap().renderList.push(asset);
            }
        }
    }

    public createAsset(name:string, mode:number = Game.SELF, newName:string = '') : BABYLON.Mesh
    {
        let mesh : BABYLON.Mesh = <BABYLON.Mesh> this.scene.getMeshByName(name);

        let res = null;
        switch (mode)
        {
            case Game.SELF:
                res = mesh;
                mesh.setEnabled(true);
                break;

            case Game.CLONE:
                res = mesh.clone(newName);
                break;

            case Game.INSTANCE:
                res = mesh.createInstance(newName);
                break;
        }

        return res;
    }

    private _runGame()
    {

    }

    private showAxis(size)
    {
        var axisX = BABYLON.Mesh.CreateLines("axisX", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
            ], this.scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);

        var xChar = this.makeTextPlane("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);

        var axisY = BABYLON.Mesh.CreateLines("axisY", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( -0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( 0.05 * size, size * 0.95, 0)
        ], this.scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);

        var yChar = this.makeTextPlane("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);

        var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0 , -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0, 0.05 * size, size * 0.95)
        ], this.scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);

        var zChar = this.makeTextPlane("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    }

    private makeTextPlane(text, color, size)
    {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, this.scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
        var plane = BABYLON.MeshBuilder.CreatePlane("TextPlane", {size: size}, this.scene);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this.scene);
        plane.material.backFaceCulling = false;
        (plane.material as BABYLON.StandardMaterial).specularColor = new BABYLON.Color3(0, 0, 0);
        (plane.material as BABYLON.StandardMaterial).diffuseTexture = dynamicTexture;
        return plane;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    new Game('renderCanvas');
});
