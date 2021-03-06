var Game = (function () {
    function Game(canvasElement) {
        var _this = this;
        this.nooftrees = 3;
        this.GROUND_WIDTH = 30;
        this.GROUND_HEIGHT = 30;
        var canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(canvas, true);
        this.engine.enableOfflineSupport = false;
        this.assets = [];
        this.scene = null;
        this.trees = [];
        window.addEventListener("resize", function () {
            _this.engine.resize();
        });
        this.initScene();
    }
    Game.prototype.initScene = function () {
        this.scene = new BABYLON.Scene(this.engine);
        var camera = new BABYLON.ArcRotateCamera('ArcRotCam', -0.65, 0.65, 50, new BABYLON.Vector3(0, 0, 0), this.scene);
        camera.attachControl(this.engine.getRenderingCanvas());
        var light = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-1, -2, 1), this.scene);
        light.intensity = 1.25;
        light.specular = BABYLON.Color3.Black();
        light.position = new BABYLON.Vector3(20, 10, -20);
        var lightSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 2, this.scene);
        lightSphere.position = light.position;
        lightSphere.material = new BABYLON.StandardMaterial("light", this.scene);
        lightSphere.material.emissiveColor = new BABYLON.Color3(1, 1, 0);
        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
        this.shadowGenerator.setDarkness(0.5);
        this.shadowGenerator.useBlurVarianceShadowMap = true;
        var loader = new Preloader(this);
        loader.callback = this.run.bind(this);
        loader.loadAssets();
    };
    Game.prototype.run = function () {
        var _this = this;
        this.scene.executeWhenReady(function () {
            var loader = document.querySelector("#splashscreen");
            loader.style.display = "none";
            _this._init();
            _this.engine.runRenderLoop(function () {
                _this.scene.render();
            });
            _this._runGame();
        });
    };
    Game.prototype._init = function () {
        this.scene.debugLayer.show();
        this.showAxis(15);
        this.prepWorld();
    };
    Game.prototype.prepWorld = function (assetToUse) {
        if (assetToUse === void 0) { assetToUse = null; }
        var ground = BABYLON.MeshBuilder.CreateBox("ground", { width: this.GROUND_WIDTH, height: 0.5, depth: this.GROUND_HEIGHT }, this.scene);
        ground.position.y = -0.25;
        ground.receiveShadows = true;
        var map = [
            [0, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, -1, -1, -1, -1, -1, -1, -1, 0],
            [0, -1, -1, -1, -1, 2, -1, -1, 0],
            [0, -1, -1, -1, -1, -1, -1, -1, 0],
            [0, -1, -1, -1, 2, -1, -1, -1, 0],
            [0, -1, -1, -1, -1, -1, -1, -1, 0],
            [0, -1, -1, -1, -1, -1, -1, -1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0]
        ];
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++) {
                var asset = void 0;
                if (map[i][j] == 0 || map[i][j] == 1) {
                    asset = this.createAsset("Mesh1 " + "Grey_Border_Wall" + " Model", Game.INSTANCE);
                    asset.position.x = i * 3 - 12;
                    if (map[i][j] == 0) {
                        asset.rotation.y = Math.PI / 2;
                        asset.position.z = j * 3 - 12;
                    }
                    else if (map[i][j] == 1) {
                        asset.position.x = i * 3 - 12;
                        asset.position.z = j * 3 - 15;
                    }
                }
                if (map[i][j] == 2) {
                    asset = this.createAsset("Mesh1 Tree Model", Game.INSTANCE);
                    asset.position.x = i * 3 - 12;
                    asset.position.y = 0.5;
                    asset.position.z = j * 3 - 12;
                }
                asset.receiveShadows = true;
                this.shadowGenerator.getShadowMap().renderList.push(asset);
            }
        }
    };
    Game.prototype.createAsset = function (name, mode, newName) {
        if (mode === void 0) { mode = Game.SELF; }
        if (newName === void 0) { newName = ''; }
        var mesh = this.scene.getMeshByName(name);
        var res = null;
        switch (mode) {
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
    };
    Game.prototype._runGame = function () {
    };
    Game.prototype.showAxis = function (size) {
        var axisX = BABYLON.Mesh.CreateLines("axisX", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
        ], this.scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        var xChar = this.makeTextPlane("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
        var axisY = BABYLON.Mesh.CreateLines("axisY", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
        ], this.scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        var yChar = this.makeTextPlane("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
        var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
        ], this.scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
        var zChar = this.makeTextPlane("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    };
    Game.prototype.makeTextPlane = function (text, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, this.scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
        var plane = BABYLON.MeshBuilder.CreatePlane("TextPlane", { size: size }, this.scene);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this.scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
    };
    return Game;
}());
Game.SELF = 0;
Game.CLONE = 1;
Game.INSTANCE = 2;
Game.Colours = {
    RED: "#D27575",
    GREY: "#675A55",
    BLUE: "#529B9C",
    GREEN: "#9CBA8F",
    YELLOW: "#EAC392"
};
window.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas');
});
