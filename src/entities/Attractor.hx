package entities;

import luxe.Entity;
import luxe.options.EntityOptions;
import luxe.Vector;
import luxe.Sprite;
import luxe.utils.Maths;
import luxe.Log.*;
import luxe.Color;
import luxe.tween.easing.*;
import luxe.components.physics.nape.*;
import nape.phys.*;
import nape.geom.*;
import components.*;

class Attractor extends Entity {

    public var disableOutsideRect = { tlx: 30, tly: 54, brx: Luxe.camera.size.x - 30, bry: 694 };
    public function enabled() {
        return pos.x >= disableOutsideRect.tlx && pos.x <= disableOutsideRect.brx && pos.y >= disableOutsideRect.tly && pos.y <= disableOutsideRect.bry;
    }

    public var sprite : Sprite;
    public var rotationRate = -180;

    public var targets : Array<CircleCollider>;

    public function new(?_options:EntityOptions) {
        super(_options);

        var dragable = new Dragable({name: 'Dragable'});
        dragable.rectX = 32;
        dragable.rectY = 32;
        add(dragable);

        var boundToArea = new BoundToArea({name: 'boundToArea'});
        boundToArea.tlx = 0;
        boundToArea.tly = 0;
        boundToArea.brx = Luxe.camera.size.x;
        boundToArea.bry = Luxe.camera.size.y;
        boundToArea.rectX = 32;
        boundToArea.rectY = 32;
        add(boundToArea);

        sprite = new Sprite({
            name: 'sprite',
            parent: this,
            color: new Color().rgb(0x000000),
            texture: Main.tex('swirl'),
            size: new Vec(32, 32),
            depth: 150,
        });
        sprite.rotation_z = Main.rand.get() * 360;
    }

    public override function update(dt:Float) {
        if (!enabled()) {
            return;
        }

        sprite.rotation_z += rotationRate*dt;

        // pull in targets
        var napePos = new Vec2(pos.x, pos.y);
        if (targets != null) {
            for (target in targets) {
                var vectorToSelf = napePos.sub(target.body.position);
                var distToSelf = vectorToSelf.length;
                var strength = Maths.clamp(1 - Quad.easeOut.calculate(distToSelf / 320), 0.05, 1) * 600;
                var deltaV = vectorToSelf.mul(strength*dt/distToSelf);
                target.body.velocity.addeq(deltaV);
            }
        }
    }
}