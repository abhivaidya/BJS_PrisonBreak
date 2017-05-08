class Player
{
    public body;

    private nb = 27;
    private layers = 3;

    constructor(scene:BABYLON.Scene)
    {
        this.body = new BABYLON.SolidParticleSystem("SPS", scene);
        var box = BABYLON.MeshBuilder.CreateBox("b", {size:1}, scene);
        this.body.addShape(box, this.nb, {positionFunction: this.myPositionFunction});
        box.dispose();

        var mesh = this.body.buildMesh();

        this.body.mesh.position.y = -0.75;
        //this.body.mesh.material.diffuseColor = BABYLON.Color3.Black();
    }

    myPositionFunction(particle, i, s)
    {
        particle.position.x = i % 3 - 1;
        particle.position.y = Math.floor(i / 9) + 1;
        particle.position.z = Math.floor((i % 9) / 3) - 1;
        particle.color = new BABYLON.Color4(0.07, 0.07, 0.07, 1);
    }

    move()
    {
        if(this.body)
        {
            this.body.mesh.rotation.x = 0;
            this.body.mesh.rotation.z = 0;
        }
    }
}
