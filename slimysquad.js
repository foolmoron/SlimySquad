(function (console, $global) { "use strict";
var $hxClasses = {},$estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
$hxClasses["EReg"] = EReg;
EReg.__name__ = ["EReg"];
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw new js__$Boot_HaxeError("EReg::matched");
	}
	,matchedRight: function() {
		if(this.r.m == null) throw new js__$Boot_HaxeError("No string matched");
		var sz = this.r.m.index + this.r.m[0].length;
		return HxOverrides.substr(this.r.s,sz,this.r.s.length - sz);
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,__class__: EReg
};
var luxe_Emitter = function() {
	this._checking = false;
	this._to_remove = new List();
	this.connected = new List();
	this.bindings = new haxe_ds_IntMap();
};
$hxClasses["luxe.Emitter"] = luxe_Emitter;
luxe_Emitter.__name__ = ["luxe","Emitter"];
luxe_Emitter.prototype = {
	_emitter_destroy: function() {
		while(this._to_remove.length > 0) {
			var _node = this._to_remove.pop();
			_node.event = null;
			_node.handler = null;
			_node = null;
		}
		while(this.connected.length > 0) {
			var _node1 = this.connected.pop();
			_node1.event = null;
			_node1.handler = null;
			_node1 = null;
		}
		this._to_remove = null;
		this.connected = null;
		this.bindings = null;
	}
	,emit: function(event,data) {
		if(this.bindings == null) return;
		this._check();
		var _list = this.bindings.h[event];
		if(_list != null && _list.length > 0) {
			var _g = 0;
			while(_g < _list.length) {
				var handler = _list[_g];
				++_g;
				handler(data);
			}
		}
		this._check();
	}
	,on: function(event,handler) {
		if(this.bindings == null) return;
		this._check();
		if(!this.bindings.h.hasOwnProperty(event)) {
			this.bindings.h[event] = [handler];
			this.connected.push({ handler : handler, event : event});
		} else {
			var _list = this.bindings.h[event];
			if(HxOverrides.indexOf(_list,handler,0) == -1) {
				_list.push(handler);
				this.connected.push({ handler : handler, event : event});
			}
		}
	}
	,off: function(event,handler) {
		if(this.bindings == null) return false;
		this._check();
		var _success = false;
		if(this.bindings.h.hasOwnProperty(event)) {
			this._to_remove.push({ event : event, handler : handler});
			var _g_head = this.connected.h;
			var _g_val = null;
			while(_g_head != null) {
				var _info;
				_info = (function($this) {
					var $r;
					_g_val = _g_head[0];
					_g_head = _g_head[1];
					$r = _g_val;
					return $r;
				}(this));
				if(_info.event == event && _info.handler == handler) this.connected.remove(_info);
			}
			_success = true;
		}
		return _success;
	}
	,connections: function(handler) {
		if(this.connected == null) return null;
		var _list = [];
		var _g_head = this.connected.h;
		var _g_val = null;
		while(_g_head != null) {
			var _info;
			_info = (function($this) {
				var $r;
				_g_val = _g_head[0];
				_g_head = _g_head[1];
				$r = _g_val;
				return $r;
			}(this));
			if(_info.handler == handler) _list.push(_info);
		}
		return _list;
	}
	,_check: function() {
		if(this._checking || this._to_remove == null) return;
		this._checking = true;
		if(this._to_remove.length > 0) {
			var _g_head = this._to_remove.h;
			var _g_val = null;
			while(_g_head != null) {
				var _node;
				_node = (function($this) {
					var $r;
					_g_val = _g_head[0];
					_g_head = _g_head[1];
					$r = _g_val;
					return $r;
				}(this));
				var _list = this.bindings.h[_node.event];
				HxOverrides.remove(_list,_node.handler);
				if(_list.length == 0) this.bindings.remove(_node.event);
			}
			this._to_remove = null;
			this._to_remove = new List();
		}
		this._checking = false;
	}
	,__class__: luxe_Emitter
};
var luxe_Objects = function(_name,_id) {
	if(_id == null) _id = "";
	if(_name == null) _name = "";
	this.name = "";
	this.id = "";
	luxe_Emitter.call(this);
	this.set_name(_name);
	this.set_id(_id == ""?Luxe.utils.uniqueid():_id);
};
$hxClasses["luxe.Objects"] = luxe_Objects;
luxe_Objects.__name__ = ["luxe","Objects"];
luxe_Objects.__super__ = luxe_Emitter;
luxe_Objects.prototype = $extend(luxe_Emitter.prototype,{
	set_name: function(_name) {
		return this.name = _name;
	}
	,set_id: function(_id) {
		return this.id = _id;
	}
	,get_name: function() {
		return this.name;
	}
	,get_id: function() {
		return this.id;
	}
	,__class__: luxe_Objects
	,__properties__: {set_name:"set_name",get_name:"get_name",set_id:"set_id",get_id:"get_id"}
});
var luxe_Entity = function(_options) {
	this.component_count = 0;
	this.active = true;
	this.fixed_rate = 0;
	this.started = false;
	this.inited = false;
	this.destroyed = false;
	luxe_Objects.call(this,"entity");
	var _g = this;
	_g.set_name(_g.get_name() + ("." + this.get_id()));
	this.options = _options;
	this._components = new luxe_components_Components(this);
	this.children = [];
	this.events = new luxe_Events();
	if(this.options != null && this.options.transform != null) this.set_transform(this.options.transform); else this.set_transform(new phoenix_Transform());
	this.get_transform().listen_pos($bind(this,this.set_pos_from_transform));
	this.get_transform().listen_scale($bind(this,this.set_scale_from_transform));
	this.get_transform().listen_origin($bind(this,this.set_origin_from_transform));
	this.get_transform().listen_parent($bind(this,this.set_parent_from_transform));
	this.get_transform().listen_rotation($bind(this,this.set_rotation_from_transform));
	if(this.options != null) {
		if(this.options.name_unique == null) this.options.name_unique = false;
		this.options.name_unique;
		if(this.options.name != null) {
			this.set_name(this.options.name);
			if(this.options.name_unique) {
				var _g1 = this;
				_g1.set_name(_g1.get_name() + ("." + this.get_id()));
			}
		}
		if(this.options.pos != null) {
			var _op = this.options.pos;
			this.set_pos(new phoenix_Vector(_op.x,_op.y,_op.z,_op.w));
		}
		if(this.options.scale != null) {
			var _os = this.options.scale;
			this.set_scale(new phoenix_Vector(_os.x,_os.y,_os.z,_os.w));
		}
		var _should_add = true;
		if(this.options.no_scene != null) {
			if(this.options.no_scene == true) {
				_should_add = false;
				null;
			}
		}
		if(this.options.parent != null) {
			_should_add = false;
			this.set_parent(this.options.parent);
			null;
		}
		if(_should_add) {
			if(this.options.scene != null) {
				this.set_scene(this.options.scene);
				null;
			} else {
				this.set_scene(Luxe.scene);
				null;
			}
		}
	} else {
		this.set_scene(Luxe.scene);
		null;
	}
	if(this.get_scene() != null) this.get_scene().add(this); else null;
	null;
};
$hxClasses["luxe.Entity"] = luxe_Entity;
luxe_Entity.__name__ = ["luxe","Entity"];
luxe_Entity.__super__ = luxe_Objects;
luxe_Entity.prototype = $extend(luxe_Objects.prototype,{
	init: function() {
	}
	,update: function(dt) {
	}
	,onfixedupdate: function(rate) {
	}
	,onreset: function() {
	}
	,ondestroy: function() {
	}
	,onkeyup: function(event) {
	}
	,onkeydown: function(event) {
	}
	,ontextinput: function(event) {
	}
	,oninputdown: function(name,event) {
	}
	,oninputup: function(name,event) {
	}
	,onmousedown: function(event) {
	}
	,onmouseup: function(event) {
	}
	,onmousemove: function(event) {
	}
	,onmousewheel: function(event) {
	}
	,ontouchdown: function(event) {
	}
	,ontouchup: function(event) {
	}
	,ontouchmove: function(event) {
	}
	,ongamepadup: function(event) {
	}
	,ongamepaddown: function(event) {
	}
	,ongamepadaxis: function(event) {
	}
	,ongamepaddevice: function(event) {
	}
	,onwindowmoved: function(event) {
	}
	,onwindowresized: function(event) {
	}
	,onwindowsized: function(event) {
	}
	,onwindowminimized: function(event) {
	}
	,onwindowrestored: function(event) {
	}
	,add: function(_component) {
		this.component_count++;
		return this._components.add(_component);
	}
	,remove: function(_name) {
		this.component_count--;
		return this._components.remove(_name);
	}
	,get: function(_name,_in_children) {
		if(_in_children == null) _in_children = false;
		return this._components.get(_name,_in_children);
	}
	,get_any: function(_name,_in_children,_first_only) {
		if(_first_only == null) _first_only = true;
		if(_in_children == null) _in_children = false;
		return this._components.get_any(_name,_in_children,_first_only);
	}
	,has: function(_name) {
		return this._components.has(_name);
	}
	,_init: function() {
		this.init();
		this.emit(2);
		if(this.component_count > 0) {
			var _g_index = 0;
			var _g_map = this._components.components;
			while(_g_index < _g_map._keys.length) {
				var _component = _g_map.get(_g_map._keys[_g_index++]);
				_component.init();
			}
		}
		if(this.children.length > 0) {
			var _g = 0;
			var _g1 = this.children;
			while(_g < _g1.length) {
				var _child = _g1[_g];
				++_g;
				_child._init();
			}
		}
		this.inited = true;
	}
	,_reset: function(_) {
		this.onreset();
		this.emit(3);
		if(this.component_count > 0) {
			var _g_index = 0;
			var _g_map = this._components.components;
			while(_g_index < _g_map._keys.length) {
				var _component = _g_map.get(_g_map._keys[_g_index++]);
				_component.onreset();
			}
		}
		if(this.children.length > 0) {
			var _g = 0;
			var _g1 = this.children;
			while(_g < _g1.length) {
				var _child = _g1[_g];
				++_g;
				_child._reset(_);
				null;
			}
		}
		this._set_fixed_rate_timer(this.fixed_rate);
		this.started = true;
	}
	,destroy: function(_from_parent) {
		if(_from_parent == null) _from_parent = false;
		if(!(this.destroyed == false)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("destroyed == false" + (" ( " + ("entity / destroying repeatedly " + this.get_name()) + " )")));
		if(this.children.length > 0) {
			var _g = 0;
			var _g1 = this.children;
			while(_g < _g1.length) {
				var _child = _g1[_g];
				++_g;
				_child.destroy(true);
				_child = null;
			}
		}
		if(this.component_count > 0) {
			var _g_index = 0;
			var _g_map = this._components.components;
			while(_g_index < _g_map._keys.length) {
				var _component = _g_map.get(_g_map._keys[_g_index++]);
				_component.onremoved();
				_component.ondestroy();
				_component = null;
			}
		}
		this.children = null;
		this._components.destroy();
		this._components = null;
		this.emit(8);
		this.ondestroy();
		if(this.get_parent() != null && !_from_parent) this.get_parent()._remove_child(this);
		if(this.fixed_rate_timer != null) {
			this.fixed_rate_timer.stop();
			this.fixed_rate_timer = null;
		}
		this.destroyed = true;
		this.inited = false;
		this.started = false;
		if(this.get_scene() != null) this.get_scene().remove(this);
		if(this.events != null) {
			this.events.destroy();
			this.events = null;
		}
		if(this.get_transform() != null) {
			this.get_transform().destroy();
			this.set_transform(null);
		}
		this._emitter_destroy();
		this.set_id(null);
	}
	,_update: function(dt) {
		if(this.destroyed) return;
		if(!this.get_active() || !this.inited || !this.started) return;
		this.get_transform().clean_check();
		this.update(dt);
		if(this.events != null) this.events.process();
		if(this.component_count > 0) {
			var _g_index = 0;
			var _g_map = this._components.components;
			while(_g_index < _g_map._keys.length) {
				var _component = _g_map.get(_g_map._keys[_g_index++]);
				_component.update(dt);
			}
		}
		if(this.children != null && this.children.length > 0) {
			var _g = 0;
			var _g1 = this.children;
			while(_g < _g1.length) {
				var _child = _g1[_g];
				++_g;
				_child._update(dt);
			}
		}
	}
	,_fixed_update: function() {
		if(this.destroyed) return;
		if(!this.get_active() || !this.inited || !this.started) return;
		this.emit(7);
		this.onfixedupdate(this.fixed_rate);
		if(this.component_count > 0) {
			var _g_index = 0;
			var _g_map = this._components.components;
			while(_g_index < _g_map._keys.length) {
				var _component = _g_map.get(_g_map._keys[_g_index++]);
				_component.onfixedupdate(this.fixed_rate);
			}
		}
		if(this.children.length > 0) {
			var _g = 0;
			var _g1 = this.children;
			while(_g < _g1.length) {
				var _child = _g1[_g];
				++_g;
				_child._fixed_update();
			}
		}
	}
	,_find_emit_source: function(_from_unlisten) {
		if(_from_unlisten == null) _from_unlisten = false;
		var _source = null;
		if(this.get_scene() != null) _source = this.get_scene(); else if(this.get_parent() != null) {
			var _looking = true;
			var _parent = this.get_parent();
			while(_looking) if(_parent.get_scene() == null) {
				if(_parent.get_parent() == null) {
					if(!_from_unlisten) haxe_Log.trace("   i / entity / " + "entity has no parent or scene, currently no core events will reach it.",{ fileName : "Entity.hx", lineNumber : 512, className : "luxe.Entity", methodName : "_find_emit_source"});
					_looking = false;
					break;
				} else _parent = _parent.get_parent();
			} else {
				_source = _parent.get_scene();
				_looking = false;
				break;
			}
		} else if(!_from_unlisten) haxe_Log.trace("   i / entity / " + "entity has no parent or scene, currently no core events will reach it.",{ fileName : "Entity.hx", lineNumber : 534, className : "luxe.Entity", methodName : "_find_emit_source"});
		return _source;
	}
	,_listen: function(_event,_handler,_self) {
		if(_self == null) _self = false;
		if(!_self) this.on(_event,_handler);
		var _source = this._find_emit_source(null);
		if(_source != null) switch(_event) {
		case 13:
			_source.on(_event,$bind(this,this._keyup));
			break;
		case 12:
			_source.on(_event,$bind(this,this._keydown));
			break;
		case 14:
			_source.on(_event,$bind(this,this._textinput));
			break;
		case 17:
			_source.on(_event,$bind(this,this._mousedown));
			break;
		case 18:
			_source.on(_event,$bind(this,this._mouseup));
			break;
		case 19:
			_source.on(_event,$bind(this,this._mousemove));
			break;
		case 20:
			_source.on(_event,$bind(this,this._mousewheel));
			break;
		case 21:
			_source.on(_event,$bind(this,this._touchdown));
			break;
		case 22:
			_source.on(_event,$bind(this,this._touchup));
			break;
		case 23:
			_source.on(_event,$bind(this,this._touchmove));
			break;
		case 16:
			_source.on(_event,$bind(this,this._inputup));
			break;
		case 15:
			_source.on(_event,$bind(this,this._inputdown));
			break;
		case 25:
			_source.on(_event,$bind(this,this._gamepaddown));
			break;
		case 26:
			_source.on(_event,$bind(this,this._gamepadup));
			break;
		case 24:
			_source.on(_event,$bind(this,this._gamepadaxis));
			break;
		case 27:
			_source.on(_event,$bind(this,this._gamepaddevice));
			break;
		case 29:
			_source.on(_event,$bind(this,this._windowmoved));
			break;
		case 30:
			_source.on(_event,$bind(this,this._windowresized));
			break;
		case 31:
			_source.on(_event,$bind(this,this._windowsized));
			break;
		case 32:
			_source.on(_event,$bind(this,this._windowminimized));
			break;
		case 33:
			_source.on(_event,$bind(this,this._windowrestored));
			break;
		}
	}
	,_unlisten: function(_event,_handler,_self) {
		if(_self == null) _self = false;
		var _source = this._find_emit_source(true);
		if(!_self) this.off(_event,_handler);
		if(_source != null) switch(_event) {
		case 13:
			_source.off(_event,$bind(this,this._keyup));
			break;
		case 12:
			_source.off(_event,$bind(this,this._keydown));
			break;
		case 14:
			_source.off(_event,$bind(this,this._textinput));
			break;
		case 17:
			_source.off(_event,$bind(this,this._mousedown));
			break;
		case 18:
			_source.off(_event,$bind(this,this._mouseup));
			break;
		case 19:
			_source.off(_event,$bind(this,this._mousemove));
			break;
		case 20:
			_source.off(_event,$bind(this,this._mousewheel));
			break;
		case 21:
			_source.off(_event,$bind(this,this._touchdown));
			break;
		case 22:
			_source.off(_event,$bind(this,this._touchup));
			break;
		case 23:
			_source.off(_event,$bind(this,this._touchmove));
			break;
		case 16:
			_source.off(_event,$bind(this,this._inputup));
			break;
		case 15:
			_source.off(_event,$bind(this,this._inputdown));
			break;
		case 25:
			_source.off(_event,$bind(this,this._gamepaddown));
			break;
		case 26:
			_source.off(_event,$bind(this,this._gamepadup));
			break;
		case 24:
			_source.off(_event,$bind(this,this._gamepadaxis));
			break;
		case 27:
			_source.off(_event,$bind(this,this._gamepaddevice));
			break;
		case 29:
			_source.off(_event,$bind(this,this._windowmoved));
			break;
		case 30:
			_source.off(_event,$bind(this,this._windowresized));
			break;
		case 31:
			_source.off(_event,$bind(this,this._windowsized));
			break;
		case 32:
			_source.off(_event,$bind(this,this._windowminimized));
			break;
		case 33:
			_source.off(_event,$bind(this,this._windowrestored));
			break;
		}
	}
	,_detach_scene: function() {
		if(this.get_scene() != null) {
			this.get_scene().off(3,$bind(this,this._reset));
			this.get_scene().off(8,$bind(this,this.destroy));
			this.get_scene().off(13,$bind(this,this._keyup));
			this.get_scene().off(12,$bind(this,this._keydown));
			this.get_scene().off(14,$bind(this,this._textinput));
			this.get_scene().off(17,$bind(this,this._mousedown));
			this.get_scene().off(18,$bind(this,this._mouseup));
			this.get_scene().off(19,$bind(this,this._mousemove));
			this.get_scene().off(20,$bind(this,this._mousewheel));
			this.get_scene().off(21,$bind(this,this._touchdown));
			this.get_scene().off(22,$bind(this,this._touchup));
			this.get_scene().off(23,$bind(this,this._touchmove));
			this.get_scene().off(16,$bind(this,this._inputup));
			this.get_scene().off(15,$bind(this,this._inputdown));
			this.get_scene().off(25,$bind(this,this._gamepaddown));
			this.get_scene().off(26,$bind(this,this._gamepadup));
			this.get_scene().off(24,$bind(this,this._gamepadaxis));
			this.get_scene().off(27,$bind(this,this._gamepaddevice));
			this.get_scene().off(29,$bind(this,this._windowmoved));
			this.get_scene().off(30,$bind(this,this._windowresized));
			this.get_scene().off(31,$bind(this,this._windowsized));
			this.get_scene().off(32,$bind(this,this._windowminimized));
			this.get_scene().off(33,$bind(this,this._windowrestored));
		}
	}
	,_attach_scene: function() {
		if(this.get_scene() != null) {
			this.get_scene().on(3,$bind(this,this._reset));
			this.get_scene().on(8,$bind(this,this.destroy));
		}
	}
	,_keyup: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.onkeyup(_event);
		this.emit(13,_event);
	}
	,_keydown: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.onkeydown(_event);
		this.emit(12,_event);
	}
	,_textinput: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.ontextinput(_event);
		this.emit(14,_event);
	}
	,_mousedown: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.onmousedown(_event);
		this.emit(17,_event);
	}
	,_mouseup: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.onmouseup(_event);
		this.emit(18,_event);
	}
	,_mousewheel: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.onmousewheel(_event);
		this.emit(20,_event);
	}
	,_mousemove: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.onmousemove(_event);
		this.emit(19,_event);
	}
	,_touchdown: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.ontouchdown(_event);
		this.emit(21,_event);
	}
	,_touchup: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.ontouchup(_event);
		this.emit(22,_event);
	}
	,_touchmove: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.ontouchmove(_event);
		this.emit(23,_event);
	}
	,_gamepadaxis: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.ongamepadaxis(_event);
		this.emit(24,_event);
	}
	,_gamepaddown: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.ongamepaddown(_event);
		this.emit(25,_event);
	}
	,_gamepadup: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.ongamepadup(_event);
		this.emit(26,_event);
	}
	,_gamepaddevice: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.ongamepaddevice(_event);
		this.emit(27,_event);
	}
	,_windowmoved: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.onwindowmoved(_event);
		this.emit(29,_event);
	}
	,_windowresized: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.onwindowresized(_event);
		this.emit(30,_event);
	}
	,_windowsized: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.onwindowsized(_event);
		this.emit(31,_event);
	}
	,_windowminimized: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.onwindowminimized(_event);
		this.emit(32,_event);
	}
	,_windowrestored: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.onwindowrestored(_event);
		this.emit(33,_event);
	}
	,_inputdown: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.oninputdown(_event.name,_event.event);
		this.emit(15,_event);
	}
	,_inputup: function(_event) {
		if(!this.get_active() || !this.inited || !this.started) return;
		this.oninputup(_event.name,_event.event);
		this.emit(16,_event);
	}
	,get_fixed_rate: function() {
		return this.fixed_rate;
	}
	,set_fixed_rate: function(_rate) {
		this.fixed_rate = _rate;
		if(this.started) {
			if(this.fixed_rate_timer != null) {
				this.fixed_rate_timer.stop();
				this.fixed_rate_timer = null;
			}
			if(_rate != 0 && this.get_parent() == null && !this.destroyed) {
				this.fixed_rate_timer = new snow_api_Timer(_rate);
				this.fixed_rate_timer.run = $bind(this,this._fixed_update);
			}
		}
		return this.fixed_rate;
	}
	,_stop_fixed_rate_timer: function() {
		if(this.fixed_rate_timer != null) {
			this.fixed_rate_timer.stop();
			this.fixed_rate_timer = null;
		}
	}
	,_set_fixed_rate_timer: function(_rate) {
		if(this.fixed_rate_timer != null) {
			this.fixed_rate_timer.stop();
			this.fixed_rate_timer = null;
		}
		if(_rate != 0 && this.get_parent() == null && !this.destroyed) {
			this.fixed_rate_timer = new snow_api_Timer(_rate);
			this.fixed_rate_timer.run = $bind(this,this._fixed_update);
		}
	}
	,get_components: function() {
		return this._components.components;
	}
	,_add_child: function(child) {
		this.children.push(child);
		if(child.get_scene() != null) {
			var _removed = child.get_scene().remove(child);
		} else null;
	}
	,_remove_child: function(child) {
		HxOverrides.remove(this.children,child);
	}
	,set_pos_from_transform: function(_pos) {
		if(this.component_count > 0) {
			var _g_index = 0;
			var _g_map = this._components.components;
			while(_g_index < _g_map._keys.length) {
				var _component = _g_map.get(_g_map._keys[_g_index++]);
				_component.entity_pos_change(_pos);
			}
		}
	}
	,set_rotation_from_transform: function(_rotation) {
		if(this.component_count > 0) {
			var _g_index = 0;
			var _g_map = this._components.components;
			while(_g_index < _g_map._keys.length) {
				var _component = _g_map.get(_g_map._keys[_g_index++]);
				_component.entity_rotation_change(_rotation);
			}
		}
	}
	,set_scale_from_transform: function(_scale) {
		if(this.component_count > 0) {
			var _g_index = 0;
			var _g_map = this._components.components;
			while(_g_index < _g_map._keys.length) {
				var _component = _g_map.get(_g_map._keys[_g_index++]);
				_component.entity_scale_change(_scale);
			}
		}
	}
	,set_origin_from_transform: function(_origin) {
		if(this.component_count > 0) {
			var _g_index = 0;
			var _g_map = this._components.components;
			while(_g_index < _g_map._keys.length) {
				var _component = _g_map.get(_g_map._keys[_g_index++]);
				_component.entity_origin_change(_origin);
			}
		}
	}
	,set_parent_from_transform: function(_parent) {
		if(this.component_count > 0) {
			var _g_index = 0;
			var _g_map = this._components.components;
			while(_g_index < _g_map._keys.length) {
				var _component = _g_map.get(_g_map._keys[_g_index++]);
				_component.entity_parent_change(_parent);
			}
		}
	}
	,set_pos: function(_p) {
		return this.get_transform().set_pos(_p);
	}
	,get_pos: function() {
		return this.get_transform().get_pos();
	}
	,set_rotation: function(_r) {
		return this.get_transform().set_rotation(_r);
	}
	,get_rotation: function() {
		return this.get_transform().get_rotation();
	}
	,set_scale: function(_s) {
		return this.get_transform().set_scale(_s);
	}
	,get_scale: function() {
		return this.get_transform().get_scale();
	}
	,set_origin: function(_origin) {
		return this.get_transform().set_origin(_origin);
	}
	,get_origin: function() {
		return this.get_transform().get_origin();
	}
	,set_transform: function(_transform) {
		return this.transform = _transform;
	}
	,get_transform: function() {
		return this.transform;
	}
	,set_parent: function(other) {
		if(!(other != this)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("other != this" + (" ( " + "Entity setting itself as parent makes no sense" + " )")));
		if(this.get_parent() != null) this.get_parent()._remove_child(this);
		this.parent = other;
		if(this.get_parent() != null) {
			this.get_parent()._add_child(this);
			this.get_transform().set_parent(this.get_parent().get_transform());
		} else this.get_transform().set_parent(null);
		return this.get_parent();
	}
	,get_parent: function() {
		return this.parent;
	}
	,set_scene: function(_scene) {
		this._detach_scene();
		this.scene = _scene;
		this._attach_scene();
		return this.get_scene();
	}
	,get_scene: function() {
		return this.scene;
	}
	,set_name: function(_name) {
		var _scene = this.get_scene();
		if(_scene != null && this.get_name() != null) {
			var key = this.get_name();
			_scene.entities.remove(key);
			if(_scene.entities.exists(_name)) haxe_Log.trace("    i / scene / " + ("" + _scene.get_name() + " / adding a second entity named " + _name + "!\r\n                This will replace the existing one, possibly leaving the previous one in limbo."),{ fileName : "Scene.hx", lineNumber : 93, className : "luxe.Scene", methodName : "handle_duplicate_warning"});
			_scene.entities.set(_name,this);
			_scene._has_changed = true;
		}
		return this.name = _name;
	}
	,set_active: function(_active) {
		return this.active = _active;
	}
	,get_active: function() {
		return this.active;
	}
	,toString: function() {
		var _list = [];
		var $it0 = HxOverrides.iter(this._components.components._keys);
		while( $it0.hasNext() ) {
			var _c = $it0.next();
			_list.push(_c);
		}
		return "luxe Entity: " + this.get_name() + " / " + Lambda.count(this._components.components) + " components:[" + _list.join(", ") + "] / id: " + this.get_id();
	}
	,__class__: luxe_Entity
	,__properties__: $extend(luxe_Objects.prototype.__properties__,{set_origin:"set_origin",get_origin:"get_origin",set_scale:"set_scale",get_scale:"get_scale",set_rotation:"set_rotation",get_rotation:"get_rotation",set_pos:"set_pos",get_pos:"get_pos",set_transform:"set_transform",get_transform:"get_transform",set_active:"set_active",get_active:"get_active",set_scene:"set_scene",get_scene:"get_scene",set_parent:"set_parent",get_parent:"get_parent",set_fixed_rate:"set_fixed_rate",get_fixed_rate:"get_fixed_rate",get_components:"get_components"})
});
var luxe_Visual = function(_options) {
	this.ignore_texture_on_geometry_change = false;
	this._creating_geometry = false;
	this._has_custom_origin = false;
	this.radians = 0.0;
	this.depth = 0.0;
	this.visible = true;
	this.locked = false;
	if(_options == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options was null" + (" ( " + "Visual requires non-null options" + " )")));
	this._rotation_euler = new phoenix_Vector();
	this._rotation_quat = new phoenix_Quaternion();
	luxe_Entity.call(this,_options);
	this.set_color(new phoenix_Color());
	this.set_size(new phoenix_Vector());
	if(this.options.texture != null) this.set_texture(this.options.texture);
	if(this.options.shader != null) this.set_shader(this.options.shader);
	if(this.options.color != null) this.set_color(this.options.color);
	if(this.options.depth != null) this.set_depth(this.options.depth);
	if(this.options.visible != null) this.set_visible(this.options.visible);
	if(this.options.size != null) {
		this.set_size(this.options.size);
		this._create_geometry();
	} else if(this.texture != null) {
		this.set_size(new phoenix_Vector(this.texture.width,this.texture.height));
		this._create_geometry();
	} else {
		this.set_size(new phoenix_Vector(64,64));
		this._create_geometry();
	}
};
$hxClasses["luxe.Visual"] = luxe_Visual;
luxe_Visual.__name__ = ["luxe","Visual"];
luxe_Visual.__super__ = luxe_Entity;
luxe_Visual.prototype = $extend(luxe_Entity.prototype,{
	_create_geometry: function() {
		if(this.options.geometry == null) {
			if(this.options.no_geometry == null || this.options.no_geometry == false) {
				this._creating_geometry = true;
				var _batcher = null;
				if(this.options.no_batcher_add == null || this.options.no_batcher_add == false) {
					if(this.options.batcher != null) _batcher = this.options.batcher; else _batcher = Luxe.renderer.batcher;
				}
				this.set_geometry(new phoenix_geometry_QuadGeometry({ id : this.get_name() + ".visual", x : 0, y : 0, w : this.size.x, h : this.size.y, scale : new phoenix_Vector(1,1,1), texture : this.texture, color : this.color, shader : this.shader, batcher : _batcher, depth : this.options.depth == null?0:this.options.depth, visible : this.options.visible == null?this.visible:this.options.visible}));
				this._creating_geometry = false;
				this.on_geometry_created();
			}
		} else this.set_geometry(this.options.geometry);
		if(this.geometry != null) {
			this.geometry.id = this.get_name() + ".visual";
			this.geometry.transform.id = this.get_name() + ".visual.transform";
		}
		if(this.options.origin != null) {
			this._has_custom_origin = true;
			this.set_origin(this.options.origin);
		}
		if(this.options.rotation_z != null) this.set_rotation_z(this.options.rotation_z);
	}
	,ondestroy: function() {
		if(this.geometry != null && this.geometry.added) this.geometry.drop(true);
		this.set_transform(null);
		this.options = null;
		this.set_geometry(null);
		this.set_texture(null);
		this.set_shader(null);
		this.set_color(null);
		this.set_size(null);
		this.set_clip_rect(null);
		this._rotation_euler = null;
		this._rotation_quat = null;
	}
	,on_geometry_created: function() {
	}
	,set_visible: function(_v) {
		this.visible = _v;
		if(this.geometry != null) this.geometry.set_visible(this.visible);
		return this.visible;
	}
	,set_depth: function(_v) {
		if(this.geometry != null) this.geometry.set_depth(_v);
		return this.depth = _v;
	}
	,set_color: function(_c) {
		if(this.color != null && this.geometry != null) this.geometry.set_color(_c);
		return this.color = _c;
	}
	,set_texture: function(_t) {
		if(this.geometry != null && this.geometry.state.texture != _t) this.geometry.set_texture(_t);
		return this.texture = _t;
	}
	,set_shader: function(_s) {
		if(this.geometry != null && this.geometry.state.shader != _s) this.geometry.set_shader(_s);
		return this.shader = _s;
	}
	,set_geometry: function(_g) {
		if(this.geometry == _g) return this.geometry;
		if(this.geometry != null) this.geometry.drop();
		this.geometry = _g;
		if(this.geometry != null) {
			this.geometry.transform.set_parent(this.get_transform());
			if(this._creating_geometry == false) {
				this.geometry.set_color(this.color);
				this.geometry.set_depth(this.depth);
				this.geometry.set_visible(this.visible);
				if(!this.ignore_texture_on_geometry_change) {
				}
			}
		}
		return this.geometry;
	}
	,set_parent_from_transform: function(_parent) {
		luxe_Entity.prototype.set_parent_from_transform.call(this,_parent);
		if(this.geometry != null) this.geometry.transform.set_parent(this.get_transform());
	}
	,set_rotation_from_transform: function(_rotation) {
		luxe_Entity.prototype.set_rotation_from_transform.call(this,_rotation);
		this._rotation_euler.setEulerFromQuaternion(_rotation,null);
		this._rotation_quat.copy(_rotation);
	}
	,set_size: function(_v) {
		this.size = _v;
		if(this.size != null) phoenix_Vector.Listen(this.size,$bind(this,this._size_change));
		return this.size;
	}
	,get_rotation_z: function() {
		return luxe_utils_Maths.degrees(this.get_radians());
	}
	,set_rotation_z: function(_degrees) {
		this.set_radians(_degrees * 0.017453292519943278);
		return _degrees;
	}
	,set_radians: function(_r) {
		this._rotation_euler.set_z(_r);
		this._rotation_quat.setFromEuler(this._rotation_euler);
		this.set_rotation(this._rotation_quat.clone());
		return this.radians = _r;
	}
	,get_radians: function() {
		return this.radians;
	}
	,set_locked: function(_l) {
		if(this.geometry != null) this.geometry.set_locked(_l);
		return this.locked = _l;
	}
	,set_clip_rect: function(_val) {
		if(this.geometry != null) this.geometry.set_clip_rect(_val);
		return this.clip_rect = _val;
	}
	,_size_change: function(_v) {
		this.set_size(this.size);
	}
	,init: function() {
		luxe_Entity.prototype.init.call(this);
	}
	,__class__: luxe_Visual
	,__properties__: $extend(luxe_Entity.prototype.__properties__,{set_rotation_z:"set_rotation_z",get_rotation_z:"get_rotation_z",set_radians:"set_radians",get_radians:"get_radians",set_clip_rect:"set_clip_rect",set_depth:"set_depth",set_visible:"set_visible",set_color:"set_color",set_shader:"set_shader",set_texture:"set_texture",set_locked:"set_locked",set_geometry:"set_geometry",set_size:"set_size"})
});
var luxe_Text = function(_options) {
	this.text_options = _options;
	this.text_bounds = new phoenix_Rectangle();
	var _batcher = null;
	if(_options.no_batcher_add == null || _options.no_batcher_add == false) {
		if(_options.batcher != null) _batcher = _options.batcher; else _batcher = Luxe.renderer.batcher;
	}
	this.geom = new phoenix_geometry_TextGeometry({ batcher : _batcher, depth : _options.depth, visible : _options.visible, immediate : _options.immediate, color : _options.color, shader : _options.shader, texture : _options.texture, text : _options.text, font : _options.font, point_size : _options.point_size, line_spacing : _options.line_spacing, letter_spacing : _options.letter_spacing, bounds : _options.bounds, bounds_wrap : _options.bounds_wrap, align : _options.align, align_vertical : _options.align_vertical, sdf : _options.sdf, smoothness : _options.smoothness, thickness : _options.thickness, outline : _options.outline, outline_color : _options.outline_color, glow_threshold : _options.glow_threshold, glow_amount : _options.glow_amount, glow_color : _options.glow_color});
	this.geom.emitter.on(1,$bind(this,this.on_geom_text_update));
	_options.geometry = this.geom;
	_options.shader = this.geom.state.shader;
	luxe_Visual.call(this,_options);
	this._update_bounds();
};
$hxClasses["luxe.Text"] = luxe_Text;
luxe_Text.__name__ = ["luxe","Text"];
luxe_Text.__super__ = luxe_Visual;
luxe_Text.prototype = $extend(luxe_Visual.prototype,{
	get_text: function() {
		return this.geom.text;
	}
	,set_text: function(_s) {
		return this.geom.set_text(_s);
	}
	,get_font: function() {
		return this.geom.font;
	}
	,set_font: function(_f) {
		return this.geom.set_font(_f);
	}
	,get_point_size: function() {
		return this.geom.point_size;
	}
	,set_point_size: function(_s) {
		return this.geom.set_point_size(_s);
	}
	,get_letter_spacing: function() {
		return this.geom.letter_spacing;
	}
	,set_letter_spacing: function(_s) {
		return this.geom.set_letter_spacing(_s);
	}
	,get_line_spacing: function() {
		return this.geom.line_spacing;
	}
	,set_line_spacing: function(_s) {
		return this.geom.set_line_spacing(_s);
	}
	,get_bounds: function() {
		return this.geom.bounds;
	}
	,set_bounds: function(_b) {
		return this.geom.set_bounds(_b);
	}
	,get_bounds_wrap: function() {
		return this.geom.bounds_wrap;
	}
	,set_bounds_wrap: function(_b) {
		return this.geom.set_bounds_wrap(_b);
	}
	,get_align: function() {
		return this.geom.align;
	}
	,set_align: function(_a) {
		return this.geom.set_align(_a);
	}
	,get_align_vertical: function() {
		return this.geom.align_vertical;
	}
	,set_align_vertical: function(_a) {
		return this.geom.set_align_vertical(_a);
	}
	,get_sdf: function() {
		return this.geom.sdf;
	}
	,set_sdf: function(_s) {
		return this.geom.sdf = _s;
	}
	,get_smoothness: function() {
		return this.geom.smoothness;
	}
	,set_smoothness: function(_s) {
		return this.geom.set_smoothness(_s);
	}
	,get_thickness: function() {
		return this.geom.thickness;
	}
	,set_thickness: function(_t) {
		return this.geom.set_thickness(_t);
	}
	,get_outline: function() {
		return this.geom.outline;
	}
	,set_outline: function(_o) {
		return this.geom.set_outline(_o);
	}
	,get_outline_color: function() {
		return this.geom.outline_color;
	}
	,set_outline_color: function(_c) {
		return this.geom.set_outline_color(_c);
	}
	,get_glow_threshold: function() {
		return this.geom.glow_threshold;
	}
	,set_glow_threshold: function(_s) {
		return this.geom.set_glow_threshold(_s);
	}
	,get_glow_amount: function() {
		return this.geom.glow_amount;
	}
	,set_glow_amount: function(_e) {
		return this.geom.set_glow_amount(_e);
	}
	,get_glow_color: function() {
		return this.geom.glow_color;
	}
	,set_glow_color: function(_c) {
		return this.geom.set_glow_color(_c);
	}
	,point_inside: function(p) {
		this._update_bounds();
		return this.text_bounds.point_inside(p);
	}
	,set_pos_from_transform: function(_p) {
		luxe_Visual.prototype.set_pos_from_transform.call(this,_p);
		this._update_bounds();
		this.text_options.pos = this.get_pos();
	}
	,on_geom_text_update: function(_) {
		this._update_bounds();
	}
	,_update_bounds: function() {
		var _x = this.get_pos().x;
		var _y = this.get_pos().y;
		var _tw = this.geom.text_width;
		var _th = this.geom.text_height;
		var _bw = this.geom.text_width;
		var _bh = this.geom.text_height;
		if(this.get_bounds() != null) {
			_bh = this.get_bounds().h;
			_bw = this.get_bounds().w;
			_x = this.get_bounds().x;
			_y = this.get_bounds().y;
			var _g = this.get_align();
			switch(_g) {
			case 2:
				_x += _tw / 2;
				break;
			case 1:
				_x += _tw;
				break;
			default:
				_x += 0.0;
			}
			var _g1 = this.get_align_vertical();
			switch(_g1) {
			case 2:
				_y += _bh / 2 - _th / 2;
				break;
			case 4:
				_y += _bh - _th;
				break;
			default:
				_y += 0.0;
			}
		} else {
			var _g2 = this.get_align();
			switch(_g2) {
			case 2:
				_x -= _tw / 2;
				break;
			case 1:
				_x -= _tw;
				break;
			default:
				_x -= 0.0;
			}
			var _g3 = this.get_align_vertical();
			switch(_g3) {
			case 2:
				_y -= _th / 2;
				break;
			case 4:
				_y -= _th;
				break;
			default:
				_y -= 0.0;
			}
		}
		this.text_bounds.set(_x,_y,_tw,_th);
	}
	,ondestroy: function() {
		this.geom = null;
		this.text_options = null;
		this.text_bounds = null;
		luxe_Visual.prototype.ondestroy.call(this);
	}
	,init: function() {
		luxe_Visual.prototype.init.call(this);
	}
	,__class__: luxe_Text
	,__properties__: $extend(luxe_Visual.prototype.__properties__,{set_glow_color:"set_glow_color",get_glow_color:"get_glow_color",set_glow_amount:"set_glow_amount",get_glow_amount:"get_glow_amount",set_glow_threshold:"set_glow_threshold",get_glow_threshold:"get_glow_threshold",set_outline_color:"set_outline_color",get_outline_color:"get_outline_color",set_outline:"set_outline",get_outline:"get_outline",set_thickness:"set_thickness",get_thickness:"get_thickness",set_smoothness:"set_smoothness",get_smoothness:"get_smoothness",set_sdf:"set_sdf",get_sdf:"get_sdf",set_align_vertical:"set_align_vertical",get_align_vertical:"get_align_vertical",set_align:"set_align",get_align:"get_align",set_bounds_wrap:"set_bounds_wrap",get_bounds_wrap:"get_bounds_wrap",set_bounds:"set_bounds",get_bounds:"get_bounds",set_line_spacing:"set_line_spacing",get_line_spacing:"get_line_spacing",set_letter_spacing:"set_letter_spacing",get_letter_spacing:"get_letter_spacing",set_point_size:"set_point_size",get_point_size:"get_point_size",set_font:"set_font",get_font:"get_font",set_text:"set_text",get_text:"get_text"})
});
var FPS = function(_options) {
	if(_options == null) _options = { };
	_options;
	if(_options.name == null) _options.name = "fps";
	_options.name;
	if(_options.pos == null) _options.pos = new phoenix_Vector(Luxe.core.screen.get_w() - 5,5);
	_options.pos;
	if(_options.point_size == null) _options.point_size = 14;
	_options.point_size;
	if(_options.align == null) _options.align = 1;
	_options.align;
	luxe_Text.call(this,_options);
};
$hxClasses["FPS"] = FPS;
FPS.__name__ = ["FPS"];
FPS.__super__ = luxe_Text;
FPS.prototype = $extend(luxe_Text.prototype,{
	update: function(dt) {
		this.set_text("FPS : " + Math.round(1.0 / Luxe.debug.dt_average));
	}
	,init: function() {
		luxe_Text.prototype.init.call(this);
	}
	,ondestroy: function() {
		luxe_Text.prototype.ondestroy.call(this);
	}
	,__class__: FPS
});
var HxOverrides = function() { };
$hxClasses["HxOverrides"] = HxOverrides;
HxOverrides.__name__ = ["HxOverrides"];
HxOverrides.strDate = function(s) {
	var _g = s.length;
	switch(_g) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k1 = s.split("-");
		return new Date(k1[0],k1[1] - 1,k1[2],0,0,0);
	case 19:
		var k2 = s.split(" ");
		var y = k2[0].split("-");
		var t = k2[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw new js__$Boot_HaxeError("Invalid date format : " + s);
	}
};
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
$hxClasses["Lambda"] = Lambda;
Lambda.__name__ = ["Lambda"];
Lambda.has = function(it,elt) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(x == elt) return true;
	}
	return false;
};
Lambda.count = function(it,pred) {
	var n = 0;
	if(pred == null) {
		var $it0 = $iterator(it)();
		while( $it0.hasNext() ) {
			var _ = $it0.next();
			n++;
		}
	} else {
		var $it1 = $iterator(it)();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			if(pred(x)) n++;
		}
	}
	return n;
};
var List = function() {
	this.length = 0;
};
$hxClasses["List"] = List;
List.__name__ = ["List"];
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,pop: function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		if(this.h == null) this.q = null;
		this.length--;
		return x;
	}
	,remove: function(v) {
		var prev = null;
		var l = this.h;
		while(l != null) {
			if(l[0] == v) {
				if(prev == null) this.h = l[1]; else prev[1] = l[1];
				if(this.q == l) this.q = prev;
				this.length--;
				return true;
			}
			prev = l;
			l = l[1];
		}
		return false;
	}
	,__class__: List
};
var Luxe = function() { };
$hxClasses["Luxe"] = Luxe;
Luxe.__name__ = ["Luxe"];
Luxe.__properties__ = {set_fixed_frame_time:"set_fixed_frame_time",get_fixed_frame_time:"get_fixed_frame_time",get_fixed_alpha:"get_fixed_alpha",set_fixed_timestep:"set_fixed_timestep",get_fixed_timestep:"get_fixed_timestep",set_fixed_delta:"set_fixed_delta",get_fixed_delta:"get_fixed_delta",get_sim_delta:"get_sim_delta",get_sim_time:"get_sim_time",set_timescale:"set_timescale",get_timescale:"get_timescale",get_tick_delta:"get_tick_delta",get_tick_start_prev:"get_tick_start_prev",get_tick_start:"get_tick_start",set_update_rate:"set_update_rate",get_update_rate:"get_update_rate",set_frame_max_delta:"set_frame_max_delta",get_frame_max_delta:"get_frame_max_delta",get_frame_start_prev:"get_frame_start_prev",get_frame_start:"get_frame_start",get_dt:"get_dt",get_build:"get_build",get_version:"get_version",get_screen:"get_screen",get_time:"get_time",get_snow:"get_snow"}
Luxe.on = function(event,handler) {
	Luxe.core.emitter.on(event,handler);
};
Luxe.off = function(event,handler) {
	return Luxe.core.emitter.off(event,handler);
};
Luxe.next = function(func) {
	if(func != null) snow_Snow.next_queue.push(func);
};
Luxe.shutdown = function() {
	Luxe.core.shutdown();
};
Luxe.showConsole = function(_show) {
	Luxe.core.show_console(_show);
};
Luxe.get_snow = function() {
	return Luxe.core.app;
};
Luxe.get_screen = function() {
	return Luxe.core.screen;
};
Luxe.get_time = function() {
	return window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
};
Luxe.get_version = function() {
	return Luxe.core.version;
};
Luxe.get_build = function() {
	return Luxe.core.build;
};
Luxe.get_dt = function() {
	return Luxe.core.frame_delta;
};
Luxe.get_frame_start = function() {
	return Luxe.core.frame_start;
};
Luxe.get_frame_start_prev = function() {
	return Luxe.core.frame_start_prev;
};
Luxe.get_frame_max_delta = function() {
	return Luxe.core.frame_max_delta;
};
Luxe.get_update_rate = function() {
	return Luxe.core.update_rate;
};
Luxe.get_tick_start = function() {
	return Luxe.core.tick_start;
};
Luxe.get_tick_start_prev = function() {
	return Luxe.core.tick_start_prev;
};
Luxe.get_tick_delta = function() {
	return Luxe.core.tick_delta;
};
Luxe.get_timescale = function() {
	return Luxe.core.timescale;
};
Luxe.get_sim_time = function() {
	return Luxe.core.sim_time;
};
Luxe.get_sim_delta = function() {
	return Luxe.core.sim_delta;
};
Luxe.get_fixed_delta = function() {
	return Luxe.core.fixed_delta;
};
Luxe.get_fixed_timestep = function() {
	return Luxe.core.fixed_timestep;
};
Luxe.get_fixed_alpha = function() {
	return Luxe.core.fixed_alpha;
};
Luxe.get_fixed_frame_time = function() {
	return Luxe.core.fixed_frame_time;
};
Luxe.set_timescale = function(_val) {
	return Luxe.core.timescale = _val;
};
Luxe.set_fixed_delta = function(_val) {
	return Luxe.core.fixed_delta = _val;
};
Luxe.set_update_rate = function(_val) {
	return Luxe.core.update_rate = _val;
};
Luxe.set_fixed_timestep = function(_val) {
	return Luxe.core.fixed_timestep = _val;
};
Luxe.set_frame_max_delta = function(_val) {
	return Luxe.core.frame_max_delta = _val;
};
Luxe.set_fixed_frame_time = function(_val) {
	return Luxe.core.fixed_frame_time = _val;
};
var LuxeApp = function() { };
$hxClasses["LuxeApp"] = LuxeApp;
LuxeApp.__name__ = ["LuxeApp"];
LuxeApp.main = function() {
	LuxeApp._conf = { headless : false, window : { width : 960, height : 640, fullscreen : false, resizable : true, borderless : false, title : "luxe app"}};
	LuxeApp._conf.window.width = 640;
	LuxeApp._conf.window.height = 640;
	LuxeApp._conf.window.fullscreen = false;
	LuxeApp._conf.window.resizable = false;
	LuxeApp._conf.window.borderless = false;
	LuxeApp._conf.window.title = "SlimySquad";
	LuxeApp._game = new Main();
	LuxeApp._snow = new snow_Snow(new luxe_Core(LuxeApp._game,LuxeApp._conf));
};
var luxe_Game = function() {
	luxe_Emitter.call(this);
};
$hxClasses["luxe.Game"] = luxe_Game;
luxe_Game.__name__ = ["luxe","Game"];
luxe_Game.__super__ = luxe_Emitter;
luxe_Game.prototype = $extend(luxe_Emitter.prototype,{
	config: function(_config) {
		return _config;
	}
	,ready: function() {
	}
	,update: function(dt) {
	}
	,onevent: function(event) {
	}
	,ondestroy: function() {
	}
	,onprerender: function() {
	}
	,onrender: function() {
	}
	,onpostrender: function() {
	}
	,oninputdown: function(_name,e) {
	}
	,oninputup: function(_name,e) {
	}
	,onmousedown: function(event) {
	}
	,onmouseup: function(event) {
	}
	,onmousewheel: function(event) {
	}
	,onmousemove: function(event) {
	}
	,onkeydown: function(event) {
	}
	,onkeyup: function(event) {
	}
	,ontextinput: function(event) {
	}
	,ontouchdown: function(event) {
	}
	,ontouchup: function(event) {
	}
	,ontouchmove: function(event) {
	}
	,ongamepadaxis: function(event) {
	}
	,ongamepaddown: function(event) {
	}
	,ongamepadup: function(event) {
	}
	,ongamepaddevice: function(event) {
	}
	,onwindowmoved: function(event) {
	}
	,onwindowresized: function(event) {
	}
	,onwindowsized: function(event) {
	}
	,onwindowminimized: function(event) {
	}
	,onwindowrestored: function(event) {
	}
	,__class__: luxe_Game
});
var Main = function() {
	this.mousePos = new phoenix_Vector(null,null,null,null);
	this.offsets = [];
	this.centers = [];
	this.squares = [];
	this.rand = new luxe_utils_Random(54039365);
	luxe_Game.call(this);
};
$hxClasses["Main"] = Main;
Main.__name__ = ["Main"];
Main.__super__ = luxe_Game;
Main.prototype = $extend(luxe_Game.prototype,{
	ready: function() {
		new FPS();
		var _g = 0;
		while(_g < 2000) {
			var i = _g++;
			this.squares.push(new luxe_Sprite({ name : "sprite" + i, pos : Luxe.core.screen.get_mid(), color : phoenix_Color.random(), size : new phoenix_Vector(16,16,null,null)}));
			this.centers.push((function($this) {
				var $r;
				var lhs = Luxe.core.screen.get_mid();
				var rhs;
				{
					var lhs1;
					var _x = $this.rand.get() - 0.5;
					var _y = $this.rand.get() - 0.5;
					lhs1 = new phoenix_Vector(_x,_y,null,null);
					rhs = phoenix_Vector.Multiply(lhs1,150);
				}
				$r = new phoenix_Vector(lhs.x + rhs.x,lhs.y + rhs.y,lhs.z + rhs.z);
				return $r;
			}(this)));
			this.offsets.push(this.rand.get() * 10);
		}
		this.app.emitter.on(19,$bind(this,this.moused));
		this.app.emitter.on(17,$bind(this,this.moused));
		this.app.emitter.on(23,$bind(this,this.touched));
		this.app.emitter.on(21,$bind(this,this.touched));
	}
	,onkeyup: function(e) {
		if(e.keycode == 27) Luxe.core.shutdown();
	}
	,moused: function(e) {
		this.mousePos = new phoenix_Vector(e.x,e.y,null,null);
	}
	,touched: function(e) {
		var lhs = new phoenix_Vector(e.x,e.y,null,null);
		var rhs = Luxe.core.screen.get_size();
		this.mousePos = new phoenix_Vector(lhs.x * rhs.x,lhs.y * rhs.y,lhs.z * rhs.z);
	}
	,update: function(dt) {
		var _g1 = 0;
		var _g = this.squares.length;
		while(_g1 < _g) {
			var i = _g1++;
			var pos;
			var lhs1 = this.centers[i];
			var rhs;
			var lhs2;
			var _x = Math.cos(window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start + this.offsets[i]);
			var _y = Math.sin(window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start + this.offsets[i]);
			lhs2 = new phoenix_Vector(_x,_y,null,null);
			rhs = phoenix_Vector.Multiply(lhs2,200);
			pos = new phoenix_Vector(lhs1.x + rhs.x,lhs1.y + rhs.y,lhs1.z + rhs.z);
			var distToMouse = ((function($this) {
				var $r;
				var lhs = $this.mousePos;
				$r = new phoenix_Vector(lhs.x - pos.x,lhs.y - pos.y,lhs.z - pos.z);
				return $r;
			}(this))).get_length();
			var amount = 150 + 30 * Math.sin(window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start + this.offsets[i]);
			var lerp = luxe_utils_Maths.clamp(Math.max(luxe_tween_easing_Back.get_easeInOut().calculate(1 - distToMouse / amount),100 / distToMouse),0,1);
			this.squares[i].set_pos((function($this) {
				var $r;
				var lhs3 = phoenix_Vector.Multiply(pos,1 - lerp);
				var rhs1 = phoenix_Vector.Multiply($this.mousePos,lerp);
				$r = new phoenix_Vector(lhs3.x + rhs1.x,lhs3.y + rhs1.y,lhs3.z + rhs1.z);
				return $r;
			}(this)));
		}
	}
	,__class__: Main
});
Math.__name__ = ["Math"];
var Reflect = function() { };
$hxClasses["Reflect"] = Reflect;
Reflect.__name__ = ["Reflect"];
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
Reflect.setField = function(o,field,value) {
	o[field] = value;
};
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) return null; else if(o.__properties__ && (tmp = o.__properties__["get_" + field])) return o[tmp](); else return o[field];
};
Reflect.setProperty = function(o,field,value) {
	var tmp;
	if(o.__properties__ && (tmp = o.__properties__["set_" + field])) o[tmp](value); else o[field] = value;
};
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
};
Reflect.deleteField = function(o,field) {
	if(!Object.prototype.hasOwnProperty.call(o,field)) return false;
	delete(o[field]);
	return true;
};
var Std = function() { };
$hxClasses["Std"] = Std;
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std["int"] = function(x) {
	return x | 0;
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
Std.parseFloat = function(x) {
	return parseFloat(x);
};
Std.random = function(x) {
	if(x <= 0) return 0; else return Math.floor(Math.random() * x);
};
var StringBuf = function() {
	this.b = "";
};
$hxClasses["StringBuf"] = StringBuf;
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype = {
	add: function(x) {
		this.b += Std.string(x);
	}
	,__class__: StringBuf
};
var StringTools = function() { };
$hxClasses["StringTools"] = StringTools;
StringTools.__name__ = ["StringTools"];
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
StringTools.rpad = function(s,c,l) {
	if(c.length <= 0) return s;
	while(s.length < l) s = s + c;
	return s;
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
};
var ValueType = $hxClasses["ValueType"] = { __ename__ : ["ValueType"], __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] };
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.toString = $estr;
ValueType.TUnknown.__enum__ = ValueType;
var Type = function() { };
$hxClasses["Type"] = Type;
Type.__name__ = ["Type"];
Type.getClassName = function(c) {
	var a = c.__name__;
	if(a == null) return null;
	return a.join(".");
};
Type.getEnumName = function(e) {
	var a = e.__ename__;
	return a.join(".");
};
Type.resolveClass = function(name) {
	var cl = $hxClasses[name];
	if(cl == null || !cl.__name__) return null;
	return cl;
};
Type.resolveEnum = function(name) {
	var e = $hxClasses[name];
	if(e == null || !e.__ename__) return null;
	return e;
};
Type.createInstance = function(cl,args) {
	var _g = args.length;
	switch(_g) {
	case 0:
		return new cl();
	case 1:
		return new cl(args[0]);
	case 2:
		return new cl(args[0],args[1]);
	case 3:
		return new cl(args[0],args[1],args[2]);
	case 4:
		return new cl(args[0],args[1],args[2],args[3]);
	case 5:
		return new cl(args[0],args[1],args[2],args[3],args[4]);
	case 6:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5]);
	case 7:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
	case 8:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
	default:
		throw new js__$Boot_HaxeError("Too many arguments");
	}
	return null;
};
Type.createEmptyInstance = function(cl) {
	function empty() {}; empty.prototype = cl.prototype;
	return new empty();
};
Type.createEnum = function(e,constr,params) {
	var f = Reflect.field(e,constr);
	if(f == null) throw new js__$Boot_HaxeError("No such constructor " + constr);
	if(Reflect.isFunction(f)) {
		if(params == null) throw new js__$Boot_HaxeError("Constructor " + constr + " need parameters");
		return Reflect.callMethod(e,f,params);
	}
	if(params != null && params.length != 0) throw new js__$Boot_HaxeError("Constructor " + constr + " does not need parameters");
	return f;
};
Type.getEnumConstructs = function(e) {
	var a = e.__constructs__;
	return a.slice();
};
Type["typeof"] = function(v) {
	var _g = typeof(v);
	switch(_g) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c = js_Boot.getClass(v);
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ || v.__ename__) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
};
var _$UInt_UInt_$Impl_$ = {};
$hxClasses["_UInt.UInt_Impl_"] = _$UInt_UInt_$Impl_$;
_$UInt_UInt_$Impl_$.__name__ = ["_UInt","UInt_Impl_"];
_$UInt_UInt_$Impl_$.toFloat = function(this1) {
	var $int = this1;
	if($int < 0) return 4294967296.0 + $int; else return $int + 0.0;
};
var haxe_StackItem = $hxClasses["haxe.StackItem"] = { __ename__ : ["haxe","StackItem"], __constructs__ : ["CFunction","Module","FilePos","Method","LocalFunction"] };
haxe_StackItem.CFunction = ["CFunction",0];
haxe_StackItem.CFunction.toString = $estr;
haxe_StackItem.CFunction.__enum__ = haxe_StackItem;
haxe_StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.LocalFunction = function(v) { var $x = ["LocalFunction",4,v]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
var haxe_CallStack = function() { };
$hxClasses["haxe.CallStack"] = haxe_CallStack;
haxe_CallStack.__name__ = ["haxe","CallStack"];
haxe_CallStack.getStack = function(e) {
	if(e == null) return [];
	var oldValue = Error.prepareStackTrace;
	Error.prepareStackTrace = function(error,callsites) {
		var stack = [];
		var _g = 0;
		while(_g < callsites.length) {
			var site = callsites[_g];
			++_g;
			if(haxe_CallStack.wrapCallSite != null) site = haxe_CallStack.wrapCallSite(site);
			var method = null;
			var fullName = site.getFunctionName();
			if(fullName != null) {
				var idx = fullName.lastIndexOf(".");
				if(idx >= 0) {
					var className = HxOverrides.substr(fullName,0,idx);
					var methodName = HxOverrides.substr(fullName,idx + 1,null);
					method = haxe_StackItem.Method(className,methodName);
				}
			}
			stack.push(haxe_StackItem.FilePos(method,site.getFileName(),site.getLineNumber()));
		}
		return stack;
	};
	var a = haxe_CallStack.makeStack(e.stack);
	Error.prepareStackTrace = oldValue;
	return a;
};
haxe_CallStack.callStack = function() {
	try {
		throw new Error();
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		var a = haxe_CallStack.getStack(e);
		a.shift();
		return a;
	}
};
haxe_CallStack.makeStack = function(s) {
	if(s == null) return []; else if(typeof(s) == "string") {
		var stack = s.split("\n");
		if(stack[0] == "Error") stack.shift();
		var m = [];
		var rie10 = new EReg("^   at ([A-Za-z0-9_. ]+) \\(([^)]+):([0-9]+):([0-9]+)\\)$","");
		var _g = 0;
		while(_g < stack.length) {
			var line = stack[_g];
			++_g;
			if(rie10.match(line)) {
				var path = rie10.matched(1).split(".");
				var meth = path.pop();
				var file = rie10.matched(2);
				var line1 = Std.parseInt(rie10.matched(3));
				m.push(haxe_StackItem.FilePos(meth == "Anonymous function"?haxe_StackItem.LocalFunction():meth == "Global code"?null:haxe_StackItem.Method(path.join("."),meth),file,line1));
			} else m.push(haxe_StackItem.Module(StringTools.trim(line)));
		}
		return m;
	} else return s;
};
var haxe_IMap = function() { };
$hxClasses["haxe.IMap"] = haxe_IMap;
haxe_IMap.__name__ = ["haxe","IMap"];
haxe_IMap.prototype = {
	__class__: haxe_IMap
};
var haxe__$Int64__$_$_$Int64 = function(high,low) {
	this.high = high;
	this.low = low;
};
$hxClasses["haxe._Int64.___Int64"] = haxe__$Int64__$_$_$Int64;
haxe__$Int64__$_$_$Int64.__name__ = ["haxe","_Int64","___Int64"];
haxe__$Int64__$_$_$Int64.prototype = {
	__class__: haxe__$Int64__$_$_$Int64
};
var haxe_Log = function() { };
$hxClasses["haxe.Log"] = haxe_Log;
haxe_Log.__name__ = ["haxe","Log"];
haxe_Log.trace = function(v,infos) {
	js_Boot.__trace(v,infos);
};
var haxe_Resource = function() { };
$hxClasses["haxe.Resource"] = haxe_Resource;
haxe_Resource.__name__ = ["haxe","Resource"];
haxe_Resource.getString = function(name) {
	var _g = 0;
	var _g1 = haxe_Resource.content;
	while(_g < _g1.length) {
		var x = _g1[_g];
		++_g;
		if(x.name == name) {
			if(x.str != null) return x.str;
			var b = haxe_crypto_Base64.decode(x.data);
			return b.toString();
		}
	}
	return null;
};
haxe_Resource.getBytes = function(name) {
	var _g = 0;
	var _g1 = haxe_Resource.content;
	while(_g < _g1.length) {
		var x = _g1[_g];
		++_g;
		if(x.name == name) {
			if(x.str != null) return haxe_io_Bytes.ofString(x.str);
			return haxe_crypto_Base64.decode(x.data);
		}
	}
	return null;
};
var haxe_Serializer = function() {
	this.buf = new StringBuf();
	this.cache = [];
	this.useCache = haxe_Serializer.USE_CACHE;
	this.useEnumIndex = haxe_Serializer.USE_ENUM_INDEX;
	this.shash = new haxe_ds_StringMap();
	this.scount = 0;
};
$hxClasses["haxe.Serializer"] = haxe_Serializer;
haxe_Serializer.__name__ = ["haxe","Serializer"];
haxe_Serializer.run = function(v) {
	var s = new haxe_Serializer();
	s.serialize(v);
	return s.toString();
};
haxe_Serializer.prototype = {
	toString: function() {
		return this.buf.b;
	}
	,serializeString: function(s) {
		var x = this.shash.get(s);
		if(x != null) {
			this.buf.b += "R";
			if(x == null) this.buf.b += "null"; else this.buf.b += "" + x;
			return;
		}
		this.shash.set(s,this.scount++);
		this.buf.b += "y";
		s = encodeURIComponent(s);
		if(s.length == null) this.buf.b += "null"; else this.buf.b += "" + s.length;
		this.buf.b += ":";
		if(s == null) this.buf.b += "null"; else this.buf.b += "" + s;
	}
	,serializeRef: function(v) {
		var vt = typeof(v);
		var _g1 = 0;
		var _g = this.cache.length;
		while(_g1 < _g) {
			var i = _g1++;
			var ci = this.cache[i];
			if(typeof(ci) == vt && ci == v) {
				this.buf.b += "r";
				if(i == null) this.buf.b += "null"; else this.buf.b += "" + i;
				return true;
			}
		}
		this.cache.push(v);
		return false;
	}
	,serializeFields: function(v) {
		var _g = 0;
		var _g1 = Reflect.fields(v);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			this.serializeString(f);
			this.serialize(Reflect.field(v,f));
		}
		this.buf.b += "g";
	}
	,serialize: function(v) {
		{
			var _g = Type["typeof"](v);
			switch(_g[1]) {
			case 0:
				this.buf.b += "n";
				break;
			case 1:
				var v1 = v;
				if(v1 == 0) {
					this.buf.b += "z";
					return;
				}
				this.buf.b += "i";
				if(v1 == null) this.buf.b += "null"; else this.buf.b += "" + v1;
				break;
			case 2:
				var v2 = v;
				if(isNaN(v2)) this.buf.b += "k"; else if(!isFinite(v2)) if(v2 < 0) this.buf.b += "m"; else this.buf.b += "p"; else {
					this.buf.b += "d";
					if(v2 == null) this.buf.b += "null"; else this.buf.b += "" + v2;
				}
				break;
			case 3:
				if(v) this.buf.b += "t"; else this.buf.b += "f";
				break;
			case 6:
				var c = _g[2];
				if(c == String) {
					this.serializeString(v);
					return;
				}
				if(this.useCache && this.serializeRef(v)) return;
				switch(c) {
				case Array:
					var ucount = 0;
					this.buf.b += "a";
					var l = v.length;
					var _g1 = 0;
					while(_g1 < l) {
						var i = _g1++;
						if(v[i] == null) ucount++; else {
							if(ucount > 0) {
								if(ucount == 1) this.buf.b += "n"; else {
									this.buf.b += "u";
									if(ucount == null) this.buf.b += "null"; else this.buf.b += "" + ucount;
								}
								ucount = 0;
							}
							this.serialize(v[i]);
						}
					}
					if(ucount > 0) {
						if(ucount == 1) this.buf.b += "n"; else {
							this.buf.b += "u";
							if(ucount == null) this.buf.b += "null"; else this.buf.b += "" + ucount;
						}
					}
					this.buf.b += "h";
					break;
				case List:
					this.buf.b += "l";
					var v3 = v;
					var _g1_head = v3.h;
					var _g1_val = null;
					while(_g1_head != null) {
						var i1;
						_g1_val = _g1_head[0];
						_g1_head = _g1_head[1];
						i1 = _g1_val;
						this.serialize(i1);
					}
					this.buf.b += "h";
					break;
				case Date:
					var d = v;
					this.buf.b += "v";
					this.buf.add(d.getTime());
					break;
				case haxe_ds_StringMap:
					this.buf.b += "b";
					var v4 = v;
					var $it0 = v4.keys();
					while( $it0.hasNext() ) {
						var k = $it0.next();
						this.serializeString(k);
						this.serialize(__map_reserved[k] != null?v4.getReserved(k):v4.h[k]);
					}
					this.buf.b += "h";
					break;
				case haxe_ds_IntMap:
					this.buf.b += "q";
					var v5 = v;
					var $it1 = v5.keys();
					while( $it1.hasNext() ) {
						var k1 = $it1.next();
						this.buf.b += ":";
						if(k1 == null) this.buf.b += "null"; else this.buf.b += "" + k1;
						this.serialize(v5.h[k1]);
					}
					this.buf.b += "h";
					break;
				case haxe_ds_ObjectMap:
					this.buf.b += "M";
					var v6 = v;
					var $it2 = v6.keys();
					while( $it2.hasNext() ) {
						var k2 = $it2.next();
						var id = Reflect.field(k2,"__id__");
						Reflect.deleteField(k2,"__id__");
						this.serialize(k2);
						k2.__id__ = id;
						this.serialize(v6.h[k2.__id__]);
					}
					this.buf.b += "h";
					break;
				case haxe_io_Bytes:
					var v7 = v;
					var i2 = 0;
					var max = v7.length - 2;
					var charsBuf = new StringBuf();
					var b64 = haxe_Serializer.BASE64;
					while(i2 < max) {
						var b1 = v7.get(i2++);
						var b2 = v7.get(i2++);
						var b3 = v7.get(i2++);
						charsBuf.add(b64.charAt(b1 >> 2));
						charsBuf.add(b64.charAt((b1 << 4 | b2 >> 4) & 63));
						charsBuf.add(b64.charAt((b2 << 2 | b3 >> 6) & 63));
						charsBuf.add(b64.charAt(b3 & 63));
					}
					if(i2 == max) {
						var b11 = v7.get(i2++);
						var b21 = v7.get(i2++);
						charsBuf.add(b64.charAt(b11 >> 2));
						charsBuf.add(b64.charAt((b11 << 4 | b21 >> 4) & 63));
						charsBuf.add(b64.charAt(b21 << 2 & 63));
					} else if(i2 == max + 1) {
						var b12 = v7.get(i2++);
						charsBuf.add(b64.charAt(b12 >> 2));
						charsBuf.add(b64.charAt(b12 << 4 & 63));
					}
					var chars = charsBuf.b;
					this.buf.b += "s";
					if(chars.length == null) this.buf.b += "null"; else this.buf.b += "" + chars.length;
					this.buf.b += ":";
					if(chars == null) this.buf.b += "null"; else this.buf.b += "" + chars;
					break;
				default:
					if(this.useCache) this.cache.pop();
					if(v.hxSerialize != null) {
						this.buf.b += "C";
						this.serializeString(Type.getClassName(c));
						if(this.useCache) this.cache.push(v);
						v.hxSerialize(this);
						this.buf.b += "g";
					} else {
						this.buf.b += "c";
						this.serializeString(Type.getClassName(c));
						if(this.useCache) this.cache.push(v);
						this.serializeFields(v);
					}
				}
				break;
			case 4:
				if(js_Boot.__instanceof(v,Class)) {
					var className = Type.getClassName(v);
					this.buf.b += "A";
					this.serializeString(className);
				} else if(js_Boot.__instanceof(v,Enum)) {
					this.buf.b += "B";
					this.serializeString(Type.getEnumName(v));
				} else {
					if(this.useCache && this.serializeRef(v)) return;
					this.buf.b += "o";
					this.serializeFields(v);
				}
				break;
			case 7:
				var e = _g[2];
				if(this.useCache) {
					if(this.serializeRef(v)) return;
					this.cache.pop();
				}
				if(this.useEnumIndex) this.buf.b += "j"; else this.buf.b += "w";
				this.serializeString(Type.getEnumName(e));
				if(this.useEnumIndex) {
					this.buf.b += ":";
					this.buf.b += Std.string(v[1]);
				} else this.serializeString(v[0]);
				this.buf.b += ":";
				var l1 = v.length;
				this.buf.b += Std.string(l1 - 2);
				var _g11 = 2;
				while(_g11 < l1) {
					var i3 = _g11++;
					this.serialize(v[i3]);
				}
				if(this.useCache) this.cache.push(v);
				break;
			case 5:
				throw new js__$Boot_HaxeError("Cannot serialize function");
				break;
			default:
				throw new js__$Boot_HaxeError("Cannot serialize " + Std.string(v));
			}
		}
	}
	,__class__: haxe_Serializer
};
var haxe_Timer = function() { };
$hxClasses["haxe.Timer"] = haxe_Timer;
haxe_Timer.__name__ = ["haxe","Timer"];
var haxe_Unserializer = function(buf) {
	this.buf = buf;
	this.length = buf.length;
	this.pos = 0;
	this.scache = [];
	this.cache = [];
	var r = haxe_Unserializer.DEFAULT_RESOLVER;
	if(r == null) {
		r = Type;
		haxe_Unserializer.DEFAULT_RESOLVER = r;
	}
	this.setResolver(r);
};
$hxClasses["haxe.Unserializer"] = haxe_Unserializer;
haxe_Unserializer.__name__ = ["haxe","Unserializer"];
haxe_Unserializer.initCodes = function() {
	var codes = [];
	var _g1 = 0;
	var _g = haxe_Unserializer.BASE64.length;
	while(_g1 < _g) {
		var i = _g1++;
		codes[haxe_Unserializer.BASE64.charCodeAt(i)] = i;
	}
	return codes;
};
haxe_Unserializer.run = function(v) {
	return new haxe_Unserializer(v).unserialize();
};
haxe_Unserializer.prototype = {
	setResolver: function(r) {
		if(r == null) this.resolver = { resolveClass : function(_) {
			return null;
		}, resolveEnum : function(_1) {
			return null;
		}}; else this.resolver = r;
	}
	,get: function(p) {
		return this.buf.charCodeAt(p);
	}
	,readDigits: function() {
		var k = 0;
		var s = false;
		var fpos = this.pos;
		while(true) {
			var c = this.buf.charCodeAt(this.pos);
			if(c != c) break;
			if(c == 45) {
				if(this.pos != fpos) break;
				s = true;
				this.pos++;
				continue;
			}
			if(c < 48 || c > 57) break;
			k = k * 10 + (c - 48);
			this.pos++;
		}
		if(s) k *= -1;
		return k;
	}
	,readFloat: function() {
		var p1 = this.pos;
		while(true) {
			var c = this.buf.charCodeAt(this.pos);
			if(c >= 43 && c < 58 || c == 101 || c == 69) this.pos++; else break;
		}
		return Std.parseFloat(HxOverrides.substr(this.buf,p1,this.pos - p1));
	}
	,unserializeObject: function(o) {
		while(true) {
			if(this.pos >= this.length) throw new js__$Boot_HaxeError("Invalid object");
			if(this.buf.charCodeAt(this.pos) == 103) break;
			var k = this.unserialize();
			if(!(typeof(k) == "string")) throw new js__$Boot_HaxeError("Invalid object key");
			var v = this.unserialize();
			o[k] = v;
		}
		this.pos++;
	}
	,unserializeEnum: function(edecl,tag) {
		if(this.get(this.pos++) != 58) throw new js__$Boot_HaxeError("Invalid enum format");
		var nargs = this.readDigits();
		if(nargs == 0) return Type.createEnum(edecl,tag);
		var args = [];
		while(nargs-- > 0) args.push(this.unserialize());
		return Type.createEnum(edecl,tag,args);
	}
	,unserialize: function() {
		var _g = this.get(this.pos++);
		switch(_g) {
		case 110:
			return null;
		case 116:
			return true;
		case 102:
			return false;
		case 122:
			return 0;
		case 105:
			return this.readDigits();
		case 100:
			return this.readFloat();
		case 121:
			var len = this.readDigits();
			if(this.get(this.pos++) != 58 || this.length - this.pos < len) throw new js__$Boot_HaxeError("Invalid string length");
			var s = HxOverrides.substr(this.buf,this.pos,len);
			this.pos += len;
			s = decodeURIComponent(s.split("+").join(" "));
			this.scache.push(s);
			return s;
		case 107:
			return NaN;
		case 109:
			return -Infinity;
		case 112:
			return Infinity;
		case 97:
			var buf = this.buf;
			var a = [];
			this.cache.push(a);
			while(true) {
				var c = this.buf.charCodeAt(this.pos);
				if(c == 104) {
					this.pos++;
					break;
				}
				if(c == 117) {
					this.pos++;
					var n = this.readDigits();
					a[a.length + n - 1] = null;
				} else a.push(this.unserialize());
			}
			return a;
		case 111:
			var o = { };
			this.cache.push(o);
			this.unserializeObject(o);
			return o;
		case 114:
			var n1 = this.readDigits();
			if(n1 < 0 || n1 >= this.cache.length) throw new js__$Boot_HaxeError("Invalid reference");
			return this.cache[n1];
		case 82:
			var n2 = this.readDigits();
			if(n2 < 0 || n2 >= this.scache.length) throw new js__$Boot_HaxeError("Invalid string reference");
			return this.scache[n2];
		case 120:
			throw new js__$Boot_HaxeError(this.unserialize());
			break;
		case 99:
			var name = this.unserialize();
			var cl = this.resolver.resolveClass(name);
			if(cl == null) throw new js__$Boot_HaxeError("Class not found " + name);
			var o1 = Type.createEmptyInstance(cl);
			this.cache.push(o1);
			this.unserializeObject(o1);
			return o1;
		case 119:
			var name1 = this.unserialize();
			var edecl = this.resolver.resolveEnum(name1);
			if(edecl == null) throw new js__$Boot_HaxeError("Enum not found " + name1);
			var e = this.unserializeEnum(edecl,this.unserialize());
			this.cache.push(e);
			return e;
		case 106:
			var name2 = this.unserialize();
			var edecl1 = this.resolver.resolveEnum(name2);
			if(edecl1 == null) throw new js__$Boot_HaxeError("Enum not found " + name2);
			this.pos++;
			var index = this.readDigits();
			var tag = Type.getEnumConstructs(edecl1)[index];
			if(tag == null) throw new js__$Boot_HaxeError("Unknown enum index " + name2 + "@" + index);
			var e1 = this.unserializeEnum(edecl1,tag);
			this.cache.push(e1);
			return e1;
		case 108:
			var l = new List();
			this.cache.push(l);
			var buf1 = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) l.add(this.unserialize());
			this.pos++;
			return l;
		case 98:
			var h = new haxe_ds_StringMap();
			this.cache.push(h);
			var buf2 = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) {
				var s1 = this.unserialize();
				h.set(s1,this.unserialize());
			}
			this.pos++;
			return h;
		case 113:
			var h1 = new haxe_ds_IntMap();
			this.cache.push(h1);
			var buf3 = this.buf;
			var c1 = this.get(this.pos++);
			while(c1 == 58) {
				var i = this.readDigits();
				h1.set(i,this.unserialize());
				c1 = this.get(this.pos++);
			}
			if(c1 != 104) throw new js__$Boot_HaxeError("Invalid IntMap format");
			return h1;
		case 77:
			var h2 = new haxe_ds_ObjectMap();
			this.cache.push(h2);
			var buf4 = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) {
				var s2 = this.unserialize();
				h2.set(s2,this.unserialize());
			}
			this.pos++;
			return h2;
		case 118:
			var d;
			if(this.buf.charCodeAt(this.pos) >= 48 && this.buf.charCodeAt(this.pos) <= 57 && this.buf.charCodeAt(this.pos + 1) >= 48 && this.buf.charCodeAt(this.pos + 1) <= 57 && this.buf.charCodeAt(this.pos + 2) >= 48 && this.buf.charCodeAt(this.pos + 2) <= 57 && this.buf.charCodeAt(this.pos + 3) >= 48 && this.buf.charCodeAt(this.pos + 3) <= 57 && this.buf.charCodeAt(this.pos + 4) == 45) {
				var s3 = HxOverrides.substr(this.buf,this.pos,19);
				d = HxOverrides.strDate(s3);
				this.pos += 19;
			} else {
				var t = this.readFloat();
				var d1 = new Date();
				d1.setTime(t);
				d = d1;
			}
			this.cache.push(d);
			return d;
		case 115:
			var len1 = this.readDigits();
			var buf5 = this.buf;
			if(this.get(this.pos++) != 58 || this.length - this.pos < len1) throw new js__$Boot_HaxeError("Invalid bytes length");
			var codes = haxe_Unserializer.CODES;
			if(codes == null) {
				codes = haxe_Unserializer.initCodes();
				haxe_Unserializer.CODES = codes;
			}
			var i1 = this.pos;
			var rest = len1 & 3;
			var size;
			size = (len1 >> 2) * 3 + (rest >= 2?rest - 1:0);
			var max = i1 + (len1 - rest);
			var bytes = haxe_io_Bytes.alloc(size);
			var bpos = 0;
			while(i1 < max) {
				var c11 = codes[StringTools.fastCodeAt(buf5,i1++)];
				var c2 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c11 << 2 | c2 >> 4);
				var c3 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c2 << 4 | c3 >> 2);
				var c4 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c3 << 6 | c4);
			}
			if(rest >= 2) {
				var c12 = codes[StringTools.fastCodeAt(buf5,i1++)];
				var c21 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c12 << 2 | c21 >> 4);
				if(rest == 3) {
					var c31 = codes[StringTools.fastCodeAt(buf5,i1++)];
					bytes.set(bpos++,c21 << 4 | c31 >> 2);
				}
			}
			this.pos += len1;
			this.cache.push(bytes);
			return bytes;
		case 67:
			var name3 = this.unserialize();
			var cl1 = this.resolver.resolveClass(name3);
			if(cl1 == null) throw new js__$Boot_HaxeError("Class not found " + name3);
			var o2 = Type.createEmptyInstance(cl1);
			this.cache.push(o2);
			o2.hxUnserialize(this);
			if(this.get(this.pos++) != 103) throw new js__$Boot_HaxeError("Invalid custom data");
			return o2;
		case 65:
			var name4 = this.unserialize();
			var cl2 = this.resolver.resolveClass(name4);
			if(cl2 == null) throw new js__$Boot_HaxeError("Class not found " + name4);
			return cl2;
		case 66:
			var name5 = this.unserialize();
			var e2 = this.resolver.resolveEnum(name5);
			if(e2 == null) throw new js__$Boot_HaxeError("Enum not found " + name5);
			return e2;
		default:
		}
		this.pos--;
		throw new js__$Boot_HaxeError("Invalid char " + this.buf.charAt(this.pos) + " at position " + this.pos);
	}
	,__class__: haxe_Unserializer
};
var haxe_Utf8 = function(size) {
	this.__b = "";
};
$hxClasses["haxe.Utf8"] = haxe_Utf8;
haxe_Utf8.__name__ = ["haxe","Utf8"];
haxe_Utf8.prototype = {
	__class__: haxe_Utf8
};
var haxe_io_Bytes = function(data) {
	this.length = data.byteLength;
	this.b = new Uint8Array(data);
	this.b.bufferValue = data;
	data.hxBytes = this;
	data.bytes = this.b;
};
$hxClasses["haxe.io.Bytes"] = haxe_io_Bytes;
haxe_io_Bytes.__name__ = ["haxe","io","Bytes"];
haxe_io_Bytes.alloc = function(length) {
	return new haxe_io_Bytes(new ArrayBuffer(length));
};
haxe_io_Bytes.ofString = function(s) {
	var a = [];
	var i = 0;
	while(i < s.length) {
		var c = StringTools.fastCodeAt(s,i++);
		if(55296 <= c && c <= 56319) c = c - 55232 << 10 | StringTools.fastCodeAt(s,i++) & 1023;
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe_io_Bytes(new Uint8Array(a).buffer);
};
haxe_io_Bytes.prototype = {
	get: function(pos) {
		return this.b[pos];
	}
	,set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,getString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				var u = (c & 15) << 18 | (c21 & 127) << 12 | (c3 & 127) << 6 | b[i++] & 127;
				s += fcc((u >> 10) + 55232);
				s += fcc(u & 1023 | 56320);
			}
		}
		return s;
	}
	,toString: function() {
		return this.getString(0,this.length);
	}
	,__class__: haxe_io_Bytes
};
var haxe_crypto_Base64 = function() { };
$hxClasses["haxe.crypto.Base64"] = haxe_crypto_Base64;
haxe_crypto_Base64.__name__ = ["haxe","crypto","Base64"];
haxe_crypto_Base64.decode = function(str,complement) {
	if(complement == null) complement = true;
	if(complement) while(HxOverrides.cca(str,str.length - 1) == 61) str = HxOverrides.substr(str,0,-1);
	return new haxe_crypto_BaseCode(haxe_crypto_Base64.BYTES).decodeBytes(haxe_io_Bytes.ofString(str));
};
var haxe_crypto_BaseCode = function(base) {
	var len = base.length;
	var nbits = 1;
	while(len > 1 << nbits) nbits++;
	if(nbits > 8 || len != 1 << nbits) throw new js__$Boot_HaxeError("BaseCode : base length must be a power of two.");
	this.base = base;
	this.nbits = nbits;
};
$hxClasses["haxe.crypto.BaseCode"] = haxe_crypto_BaseCode;
haxe_crypto_BaseCode.__name__ = ["haxe","crypto","BaseCode"];
haxe_crypto_BaseCode.prototype = {
	initTable: function() {
		var tbl = [];
		var _g = 0;
		while(_g < 256) {
			var i = _g++;
			tbl[i] = -1;
		}
		var _g1 = 0;
		var _g2 = this.base.length;
		while(_g1 < _g2) {
			var i1 = _g1++;
			tbl[this.base.b[i1]] = i1;
		}
		this.tbl = tbl;
	}
	,decodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		if(this.tbl == null) this.initTable();
		var tbl = this.tbl;
		var size = b.length * nbits >> 3;
		var out = haxe_io_Bytes.alloc(size);
		var buf = 0;
		var curbits = 0;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < 8) {
				curbits += nbits;
				buf <<= nbits;
				var i = tbl[b.get(pin++)];
				if(i == -1) throw new js__$Boot_HaxeError("BaseCode : invalid encoded char");
				buf |= i;
			}
			curbits -= 8;
			out.set(pout++,buf >> curbits & 255);
		}
		return out;
	}
	,__class__: haxe_crypto_BaseCode
};
var haxe_crypto_Md5 = function() {
};
$hxClasses["haxe.crypto.Md5"] = haxe_crypto_Md5;
haxe_crypto_Md5.__name__ = ["haxe","crypto","Md5"];
haxe_crypto_Md5.encode = function(s) {
	var m = new haxe_crypto_Md5();
	var h = m.doEncode(haxe_crypto_Md5.str2blks(s));
	return m.hex(h);
};
haxe_crypto_Md5.str2blks = function(str) {
	var nblk = (str.length + 8 >> 6) + 1;
	var blks = [];
	var blksSize = nblk * 16;
	var _g = 0;
	while(_g < blksSize) {
		var i1 = _g++;
		blks[i1] = 0;
	}
	var i = 0;
	while(i < str.length) {
		blks[i >> 2] |= HxOverrides.cca(str,i) << (str.length * 8 + i) % 4 * 8;
		i++;
	}
	blks[i >> 2] |= 128 << (str.length * 8 + i) % 4 * 8;
	var l = str.length * 8;
	var k = nblk * 16 - 2;
	blks[k] = l & 255;
	blks[k] |= (l >>> 8 & 255) << 8;
	blks[k] |= (l >>> 16 & 255) << 16;
	blks[k] |= (l >>> 24 & 255) << 24;
	return blks;
};
haxe_crypto_Md5.prototype = {
	bitOR: function(a,b) {
		var lsb = a & 1 | b & 1;
		var msb31 = a >>> 1 | b >>> 1;
		return msb31 << 1 | lsb;
	}
	,bitXOR: function(a,b) {
		var lsb = a & 1 ^ b & 1;
		var msb31 = a >>> 1 ^ b >>> 1;
		return msb31 << 1 | lsb;
	}
	,bitAND: function(a,b) {
		var lsb = a & 1 & (b & 1);
		var msb31 = a >>> 1 & b >>> 1;
		return msb31 << 1 | lsb;
	}
	,addme: function(x,y) {
		var lsw = (x & 65535) + (y & 65535);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return msw << 16 | lsw & 65535;
	}
	,hex: function(a) {
		var str = "";
		var hex_chr = "0123456789abcdef";
		var _g = 0;
		while(_g < a.length) {
			var num = a[_g];
			++_g;
			var _g1 = 0;
			while(_g1 < 4) {
				var j = _g1++;
				str += hex_chr.charAt(num >> j * 8 + 4 & 15) + hex_chr.charAt(num >> j * 8 & 15);
			}
		}
		return str;
	}
	,rol: function(num,cnt) {
		return num << cnt | num >>> 32 - cnt;
	}
	,cmn: function(q,a,b,x,s,t) {
		return this.addme(this.rol(this.addme(this.addme(a,q),this.addme(x,t)),s),b);
	}
	,ff: function(a,b,c,d,x,s,t) {
		return this.cmn(this.bitOR(this.bitAND(b,c),this.bitAND(~b,d)),a,b,x,s,t);
	}
	,gg: function(a,b,c,d,x,s,t) {
		return this.cmn(this.bitOR(this.bitAND(b,d),this.bitAND(c,~d)),a,b,x,s,t);
	}
	,hh: function(a,b,c,d,x,s,t) {
		return this.cmn(this.bitXOR(this.bitXOR(b,c),d),a,b,x,s,t);
	}
	,ii: function(a,b,c,d,x,s,t) {
		return this.cmn(this.bitXOR(c,this.bitOR(b,~d)),a,b,x,s,t);
	}
	,doEncode: function(x) {
		var a = 1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d = 271733878;
		var step;
		var i = 0;
		while(i < x.length) {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
			step = 0;
			a = this.ff(a,b,c,d,x[i],7,-680876936);
			d = this.ff(d,a,b,c,x[i + 1],12,-389564586);
			c = this.ff(c,d,a,b,x[i + 2],17,606105819);
			b = this.ff(b,c,d,a,x[i + 3],22,-1044525330);
			a = this.ff(a,b,c,d,x[i + 4],7,-176418897);
			d = this.ff(d,a,b,c,x[i + 5],12,1200080426);
			c = this.ff(c,d,a,b,x[i + 6],17,-1473231341);
			b = this.ff(b,c,d,a,x[i + 7],22,-45705983);
			a = this.ff(a,b,c,d,x[i + 8],7,1770035416);
			d = this.ff(d,a,b,c,x[i + 9],12,-1958414417);
			c = this.ff(c,d,a,b,x[i + 10],17,-42063);
			b = this.ff(b,c,d,a,x[i + 11],22,-1990404162);
			a = this.ff(a,b,c,d,x[i + 12],7,1804603682);
			d = this.ff(d,a,b,c,x[i + 13],12,-40341101);
			c = this.ff(c,d,a,b,x[i + 14],17,-1502002290);
			b = this.ff(b,c,d,a,x[i + 15],22,1236535329);
			a = this.gg(a,b,c,d,x[i + 1],5,-165796510);
			d = this.gg(d,a,b,c,x[i + 6],9,-1069501632);
			c = this.gg(c,d,a,b,x[i + 11],14,643717713);
			b = this.gg(b,c,d,a,x[i],20,-373897302);
			a = this.gg(a,b,c,d,x[i + 5],5,-701558691);
			d = this.gg(d,a,b,c,x[i + 10],9,38016083);
			c = this.gg(c,d,a,b,x[i + 15],14,-660478335);
			b = this.gg(b,c,d,a,x[i + 4],20,-405537848);
			a = this.gg(a,b,c,d,x[i + 9],5,568446438);
			d = this.gg(d,a,b,c,x[i + 14],9,-1019803690);
			c = this.gg(c,d,a,b,x[i + 3],14,-187363961);
			b = this.gg(b,c,d,a,x[i + 8],20,1163531501);
			a = this.gg(a,b,c,d,x[i + 13],5,-1444681467);
			d = this.gg(d,a,b,c,x[i + 2],9,-51403784);
			c = this.gg(c,d,a,b,x[i + 7],14,1735328473);
			b = this.gg(b,c,d,a,x[i + 12],20,-1926607734);
			a = this.hh(a,b,c,d,x[i + 5],4,-378558);
			d = this.hh(d,a,b,c,x[i + 8],11,-2022574463);
			c = this.hh(c,d,a,b,x[i + 11],16,1839030562);
			b = this.hh(b,c,d,a,x[i + 14],23,-35309556);
			a = this.hh(a,b,c,d,x[i + 1],4,-1530992060);
			d = this.hh(d,a,b,c,x[i + 4],11,1272893353);
			c = this.hh(c,d,a,b,x[i + 7],16,-155497632);
			b = this.hh(b,c,d,a,x[i + 10],23,-1094730640);
			a = this.hh(a,b,c,d,x[i + 13],4,681279174);
			d = this.hh(d,a,b,c,x[i],11,-358537222);
			c = this.hh(c,d,a,b,x[i + 3],16,-722521979);
			b = this.hh(b,c,d,a,x[i + 6],23,76029189);
			a = this.hh(a,b,c,d,x[i + 9],4,-640364487);
			d = this.hh(d,a,b,c,x[i + 12],11,-421815835);
			c = this.hh(c,d,a,b,x[i + 15],16,530742520);
			b = this.hh(b,c,d,a,x[i + 2],23,-995338651);
			a = this.ii(a,b,c,d,x[i],6,-198630844);
			d = this.ii(d,a,b,c,x[i + 7],10,1126891415);
			c = this.ii(c,d,a,b,x[i + 14],15,-1416354905);
			b = this.ii(b,c,d,a,x[i + 5],21,-57434055);
			a = this.ii(a,b,c,d,x[i + 12],6,1700485571);
			d = this.ii(d,a,b,c,x[i + 3],10,-1894986606);
			c = this.ii(c,d,a,b,x[i + 10],15,-1051523);
			b = this.ii(b,c,d,a,x[i + 1],21,-2054922799);
			a = this.ii(a,b,c,d,x[i + 8],6,1873313359);
			d = this.ii(d,a,b,c,x[i + 15],10,-30611744);
			c = this.ii(c,d,a,b,x[i + 6],15,-1560198380);
			b = this.ii(b,c,d,a,x[i + 13],21,1309151649);
			a = this.ii(a,b,c,d,x[i + 4],6,-145523070);
			d = this.ii(d,a,b,c,x[i + 11],10,-1120210379);
			c = this.ii(c,d,a,b,x[i + 2],15,718787259);
			b = this.ii(b,c,d,a,x[i + 9],21,-343485551);
			a = this.addme(a,olda);
			b = this.addme(b,oldb);
			c = this.addme(c,oldc);
			d = this.addme(d,oldd);
			i += 16;
		}
		return [a,b,c,d];
	}
	,__class__: haxe_crypto_Md5
};
var haxe_ds_IntMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.IntMap"] = haxe_ds_IntMap;
haxe_ds_IntMap.__name__ = ["haxe","ds","IntMap"];
haxe_ds_IntMap.__interfaces__ = [haxe_IMap];
haxe_ds_IntMap.prototype = {
	set: function(key,value) {
		this.h[key] = value;
	}
	,get: function(key) {
		return this.h[key];
	}
	,exists: function(key) {
		return this.h.hasOwnProperty(key);
	}
	,remove: function(key) {
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i];
		}};
	}
	,__class__: haxe_ds_IntMap
};
var haxe_ds_ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
$hxClasses["haxe.ds.ObjectMap"] = haxe_ds_ObjectMap;
haxe_ds_ObjectMap.__name__ = ["haxe","ds","ObjectMap"];
haxe_ds_ObjectMap.__interfaces__ = [haxe_IMap];
haxe_ds_ObjectMap.prototype = {
	set: function(key,value) {
		var id = key.__id__ || (key.__id__ = ++haxe_ds_ObjectMap.count);
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,get: function(key) {
		return this.h[key.__id__];
	}
	,exists: function(key) {
		return this.h.__keys__[key.__id__] != null;
	}
	,remove: function(key) {
		var id = key.__id__;
		if(this.h.__keys__[id] == null) return false;
		delete(this.h[id]);
		delete(this.h.__keys__[id]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) a.push(this.h.__keys__[key]);
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i.__id__];
		}};
	}
	,__class__: haxe_ds_ObjectMap
};
var haxe_ds__$StringMap_StringMapIterator = function(map,keys) {
	this.map = map;
	this.keys = keys;
	this.index = 0;
	this.count = keys.length;
};
$hxClasses["haxe.ds._StringMap.StringMapIterator"] = haxe_ds__$StringMap_StringMapIterator;
haxe_ds__$StringMap_StringMapIterator.__name__ = ["haxe","ds","_StringMap","StringMapIterator"];
haxe_ds__$StringMap_StringMapIterator.prototype = {
	hasNext: function() {
		return this.index < this.count;
	}
	,next: function() {
		return this.map.get(this.keys[this.index++]);
	}
	,__class__: haxe_ds__$StringMap_StringMapIterator
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.StringMap"] = haxe_ds_StringMap;
haxe_ds_StringMap.__name__ = ["haxe","ds","StringMap"];
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	set: function(key,value) {
		if(__map_reserved[key] != null) this.setReserved(key,value); else this.h[key] = value;
	}
	,get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,exists: function(key) {
		if(__map_reserved[key] != null) return this.existsReserved(key);
		return this.h.hasOwnProperty(key);
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) return null; else return this.rh["$" + key];
	}
	,existsReserved: function(key) {
		if(this.rh == null) return false;
		return this.rh.hasOwnProperty("$" + key);
	}
	,remove: function(key) {
		if(__map_reserved[key] != null) {
			key = "$" + key;
			if(this.rh == null || !this.rh.hasOwnProperty(key)) return false;
			delete(this.rh[key]);
			return true;
		} else {
			if(!this.h.hasOwnProperty(key)) return false;
			delete(this.h[key]);
			return true;
		}
	}
	,keys: function() {
		var _this = this.arrayKeys();
		return HxOverrides.iter(_this);
	}
	,arrayKeys: function() {
		var out = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) out.push(key);
		}
		if(this.rh != null) {
			for( var key in this.rh ) {
			if(key.charCodeAt(0) == 36) out.push(key.substr(1));
			}
		}
		return out;
	}
	,iterator: function() {
		return new haxe_ds__$StringMap_StringMapIterator(this,this.arrayKeys());
	}
	,__class__: haxe_ds_StringMap
};
var haxe_io_Error = $hxClasses["haxe.io.Error"] = { __ename__ : ["haxe","io","Error"], __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe_io_Error.Blocked = ["Blocked",0];
haxe_io_Error.Blocked.toString = $estr;
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow",1];
haxe_io_Error.Overflow.toString = $estr;
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds",2];
haxe_io_Error.OutsideBounds.toString = $estr;
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe_io_Error; $x.toString = $estr; return $x; };
var haxe_io_FPHelper = function() { };
$hxClasses["haxe.io.FPHelper"] = haxe_io_FPHelper;
haxe_io_FPHelper.__name__ = ["haxe","io","FPHelper"];
haxe_io_FPHelper.i32ToFloat = function(i) {
	var sign = 1 - (i >>> 31 << 1);
	var exp = i >>> 23 & 255;
	var sig = i & 8388607;
	if(sig == 0 && exp == 0) return 0.0;
	return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp - 127);
};
haxe_io_FPHelper.floatToI32 = function(f) {
	if(f == 0) return 0;
	var af;
	if(f < 0) af = -f; else af = f;
	var exp = Math.floor(Math.log(af) / 0.6931471805599453);
	if(exp < -127) exp = -127; else if(exp > 128) exp = 128;
	var sig = Math.round((af / Math.pow(2,exp) - 1) * 8388608) & 8388607;
	return (f < 0?-2147483648:0) | exp + 127 << 23 | sig;
};
haxe_io_FPHelper.i64ToDouble = function(low,high) {
	var sign = 1 - (high >>> 31 << 1);
	var exp = (high >> 20 & 2047) - 1023;
	var sig = (high & 1048575) * 4294967296. + (low >>> 31) * 2147483648. + (low & 2147483647);
	if(sig == 0 && exp == -1023) return 0.0;
	return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
};
haxe_io_FPHelper.doubleToI64 = function(v) {
	var i64 = haxe_io_FPHelper.i64tmp;
	if(v == 0) {
		i64.low = 0;
		i64.high = 0;
	} else {
		var av;
		if(v < 0) av = -v; else av = v;
		var exp = Math.floor(Math.log(av) / 0.6931471805599453);
		var sig;
		var v1 = (av / Math.pow(2,exp) - 1) * 4503599627370496.;
		sig = Math.round(v1);
		var sig_l = sig | 0;
		var sig_h = sig / 4294967296.0 | 0;
		i64.low = sig_l;
		i64.high = (v < 0?-2147483648:0) | exp + 1023 << 20 | sig_h;
	}
	return i64;
};
var haxe_io_Path = function(path) {
	switch(path) {
	case ".":case "..":
		this.dir = path;
		this.file = "";
		return;
	}
	var c1 = path.lastIndexOf("/");
	var c2 = path.lastIndexOf("\\");
	if(c1 < c2) {
		this.dir = HxOverrides.substr(path,0,c2);
		path = HxOverrides.substr(path,c2 + 1,null);
		this.backslash = true;
	} else if(c2 < c1) {
		this.dir = HxOverrides.substr(path,0,c1);
		path = HxOverrides.substr(path,c1 + 1,null);
	} else this.dir = null;
	var cp = path.lastIndexOf(".");
	if(cp != -1) {
		this.ext = HxOverrides.substr(path,cp + 1,null);
		this.file = HxOverrides.substr(path,0,cp);
	} else {
		this.ext = null;
		this.file = path;
	}
};
$hxClasses["haxe.io.Path"] = haxe_io_Path;
haxe_io_Path.__name__ = ["haxe","io","Path"];
haxe_io_Path.directory = function(path) {
	var s = new haxe_io_Path(path);
	if(s.dir == null) return "";
	return s.dir;
};
haxe_io_Path.extension = function(path) {
	var s = new haxe_io_Path(path);
	if(s.ext == null) return "";
	return s.ext;
};
haxe_io_Path.join = function(paths) {
	var paths1 = paths.filter(function(s) {
		return s != null && s != "";
	});
	if(paths1.length == 0) return "";
	var path = paths1[0];
	var _g1 = 1;
	var _g = paths1.length;
	while(_g1 < _g) {
		var i = _g1++;
		path = haxe_io_Path.addTrailingSlash(path);
		path += paths1[i];
	}
	return haxe_io_Path.normalize(path);
};
haxe_io_Path.normalize = function(path) {
	var slash = "/";
	path = path.split("\\").join("/");
	if(path == null || path == slash) return slash;
	var target = [];
	var _g = 0;
	var _g1 = path.split(slash);
	while(_g < _g1.length) {
		var token = _g1[_g];
		++_g;
		if(token == ".." && target.length > 0 && target[target.length - 1] != "..") target.pop(); else if(token != ".") target.push(token);
	}
	var tmp = target.join(slash);
	var regex = new EReg("([^:])/+","g");
	var result = regex.replace(tmp,"$1" + slash);
	var acc = new StringBuf();
	var colon = false;
	var slashes = false;
	var _g11 = 0;
	var _g2 = tmp.length;
	while(_g11 < _g2) {
		var i = _g11++;
		var _g21 = HxOverrides.cca(tmp,i);
		var i1 = _g21;
		if(_g21 != null) switch(_g21) {
		case 58:
			acc.b += ":";
			colon = true;
			break;
		case 47:
			if(colon == false) slashes = true; else {
				colon = false;
				if(slashes) {
					acc.b += "/";
					slashes = false;
				}
				acc.add(String.fromCharCode(i1));
			}
			break;
		default:
			colon = false;
			if(slashes) {
				acc.b += "/";
				slashes = false;
			}
			acc.add(String.fromCharCode(i1));
		} else {
			colon = false;
			if(slashes) {
				acc.b += "/";
				slashes = false;
			}
			acc.add(String.fromCharCode(i1));
		}
	}
	var result1 = acc.b;
	return result1;
};
haxe_io_Path.addTrailingSlash = function(path) {
	if(path.length == 0) return "/";
	var c1 = path.lastIndexOf("/");
	var c2 = path.lastIndexOf("\\");
	if(c1 < c2) {
		if(c2 != path.length - 1) return path + "\\"; else return path;
	} else if(c1 != path.length - 1) return path + "/"; else return path;
};
haxe_io_Path.prototype = {
	__class__: haxe_io_Path
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
$hxClasses["js._Boot.HaxeError"] = js__$Boot_HaxeError;
js__$Boot_HaxeError.__name__ = ["js","_Boot","HaxeError"];
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
$hxClasses["js.Boot"] = js_Boot;
js_Boot.__name__ = ["js","Boot"];
js_Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
};
js_Boot.__trace = function(v,i) {
	var msg;
	if(i != null) msg = i.fileName + ":" + i.lineNumber + ": "; else msg = "";
	msg += js_Boot.__string_rec(v,"");
	if(i != null && i.customParams != null) {
		var _g = 0;
		var _g1 = i.customParams;
		while(_g < _g1.length) {
			var v1 = _g1[_g];
			++_g;
			msg += "," + js_Boot.__string_rec(v1,"");
		}
	}
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js_Boot.__unhtml(msg) + "<br/>"; else if(typeof console != "undefined" && console.log != null) console.log(msg);
};
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__cast = function(o,t) {
	if(js_Boot.__instanceof(o,t)) return o; else throw new js__$Boot_HaxeError("Cannot cast " + Std.string(o) + " to " + Std.string(t));
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
var js_html__$CanvasElement_CanvasUtil = function() { };
$hxClasses["js.html._CanvasElement.CanvasUtil"] = js_html__$CanvasElement_CanvasUtil;
js_html__$CanvasElement_CanvasUtil.__name__ = ["js","html","_CanvasElement","CanvasUtil"];
js_html__$CanvasElement_CanvasUtil.getContextWebGL = function(canvas,attribs) {
	var _g = 0;
	var _g1 = ["webgl","experimental-webgl"];
	while(_g < _g1.length) {
		var name = _g1[_g];
		++_g;
		var ctx = canvas.getContext(name,attribs);
		if(ctx != null) return ctx;
	}
	return null;
};
var js_html_compat_ArrayBuffer = function(a) {
	if((a instanceof Array) && a.__enum__ == null) {
		this.a = a;
		this.byteLength = a.length;
	} else {
		var len = a;
		this.a = [];
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			this.a[i] = 0;
		}
		this.byteLength = len;
	}
};
$hxClasses["js.html.compat.ArrayBuffer"] = js_html_compat_ArrayBuffer;
js_html_compat_ArrayBuffer.__name__ = ["js","html","compat","ArrayBuffer"];
js_html_compat_ArrayBuffer.sliceImpl = function(begin,end) {
	var u = new Uint8Array(this,begin,end == null?null:end - begin);
	var result = new ArrayBuffer(u.byteLength);
	var resultArray = new Uint8Array(result);
	resultArray.set(u);
	return result;
};
js_html_compat_ArrayBuffer.prototype = {
	slice: function(begin,end) {
		return new js_html_compat_ArrayBuffer(this.a.slice(begin,end));
	}
	,__class__: js_html_compat_ArrayBuffer
};
var js_html_compat_DataView = function(buffer,byteOffset,byteLength) {
	this.buf = buffer;
	if(byteOffset == null) this.offset = 0; else this.offset = byteOffset;
	if(byteLength == null) this.length = buffer.byteLength - this.offset; else this.length = byteLength;
	if(this.offset < 0 || this.length < 0 || this.offset + this.length > buffer.byteLength) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
};
$hxClasses["js.html.compat.DataView"] = js_html_compat_DataView;
js_html_compat_DataView.__name__ = ["js","html","compat","DataView"];
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		if(v >= 128) return v - 256; else return v;
	}
	,getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	}
	,getInt16: function(byteOffset,littleEndian) {
		var v = this.getUint16(byteOffset,littleEndian);
		if(v >= 32768) return v - 65536; else return v;
	}
	,getUint16: function(byteOffset,littleEndian) {
		if(littleEndian) return this.buf.a[this.offset + byteOffset] | this.buf.a[this.offset + byteOffset + 1] << 8; else return this.buf.a[this.offset + byteOffset] << 8 | this.buf.a[this.offset + byteOffset + 1];
	}
	,getInt32: function(byteOffset,littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		if(littleEndian) return a | b << 8 | c << 16 | d << 24; else return d | c << 8 | b << 16 | a << 24;
	}
	,getUint32: function(byteOffset,littleEndian) {
		var v = this.getInt32(byteOffset,littleEndian);
		if(v < 0) return v + 4294967296.; else return v;
	}
	,getFloat32: function(byteOffset,littleEndian) {
		return haxe_io_FPHelper.i32ToFloat(this.getInt32(byteOffset,littleEndian));
	}
	,getFloat64: function(byteOffset,littleEndian) {
		var a = this.getInt32(byteOffset,littleEndian);
		var b = this.getInt32(byteOffset + 4,littleEndian);
		return haxe_io_FPHelper.i64ToDouble(littleEndian?a:b,littleEndian?b:a);
	}
	,setInt8: function(byteOffset,value) {
		if(value < 0) this.buf.a[byteOffset + this.offset] = value + 128 & 255; else this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setUint8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setInt16: function(byteOffset,value,littleEndian) {
		this.setUint16(byteOffset,value < 0?value + 65536:value,littleEndian);
	}
	,setUint16: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
		} else {
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p] = value & 255;
		}
	}
	,setInt32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,value,littleEndian);
	}
	,setUint32: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p++] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >>> 24;
		} else {
			this.buf.a[p++] = value >>> 24;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value & 255;
		}
	}
	,setFloat32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,haxe_io_FPHelper.floatToI32(value),littleEndian);
	}
	,setFloat64: function(byteOffset,value,littleEndian) {
		var i64 = haxe_io_FPHelper.doubleToI64(value);
		if(littleEndian) {
			this.setUint32(byteOffset,i64.low);
			this.setUint32(byteOffset,i64.high);
		} else {
			this.setUint32(byteOffset,i64.high);
			this.setUint32(byteOffset,i64.low);
		}
	}
	,__class__: js_html_compat_DataView
};
var js_html_compat_Uint8Array = function() { };
$hxClasses["js.html.compat.Uint8Array"] = js_html_compat_Uint8Array;
js_html_compat_Uint8Array.__name__ = ["js","html","compat","Uint8Array"];
js_html_compat_Uint8Array._new = function(arg1,offset,length) {
	var arr;
	if(typeof(arg1) == "number") {
		arr = [];
		var _g = 0;
		while(_g < arg1) {
			var i = _g++;
			arr[i] = 0;
		}
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else if(js_Boot.__instanceof(arg1,js_html_compat_ArrayBuffer)) {
		var buffer = arg1;
		if(offset == null) offset = 0;
		if(length == null) length = buffer.byteLength - offset;
		if(offset == 0) arr = buffer.a; else arr = buffer.a.slice(offset,offset + length);
		arr.byteLength = arr.length;
		arr.byteOffset = offset;
		arr.buffer = buffer;
	} else if((arg1 instanceof Array) && arg1.__enum__ == null) {
		arr = arg1.slice();
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else throw new js__$Boot_HaxeError("TODO " + Std.string(arg1));
	arr.subarray = js_html_compat_Uint8Array._subarray;
	arr.set = js_html_compat_Uint8Array._set;
	return arr;
};
js_html_compat_Uint8Array._set = function(arg,offset) {
	var t = this;
	if(js_Boot.__instanceof(arg.buffer,js_html_compat_ArrayBuffer)) {
		var a = arg;
		if(arg.byteLength + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g1 = 0;
		var _g = arg.byteLength;
		while(_g1 < _g) {
			var i = _g1++;
			t[i + offset] = a[i];
		}
	} else if((arg instanceof Array) && arg.__enum__ == null) {
		var a1 = arg;
		if(a1.length + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g11 = 0;
		var _g2 = a1.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			t[i1 + offset] = a1[i1];
		}
	} else throw new js__$Boot_HaxeError("TODO");
};
js_html_compat_Uint8Array._subarray = function(start,end) {
	var t = this;
	var a = js_html_compat_Uint8Array._new(t.slice(start,end));
	a.byteOffset = start;
	return a;
};
var luxe_Audio = function(_core) {
	this.core = _core;
};
$hxClasses["luxe.Audio"] = luxe_Audio;
luxe_Audio.__name__ = ["luxe","Audio"];
luxe_Audio.prototype = {
	on: function(_event,_handler) {
		this.core.app.audio.on_Int(_event,_handler);
	}
	,off: function(_event,_handler) {
		return this.core.app.audio.off_Int(_event,_handler);
	}
	,emit: function(_event,_handle) {
		this.core.app.audio.emit_Int(_event,_handle);
	}
	,play: function(_source,_volume,_paused) {
		if(_paused == null) _paused = false;
		if(_volume == null) _volume = 1.0;
		return this.core.app.audio.play(_source,_volume,_paused);
	}
	,loop: function(_source,_volume,_paused) {
		if(_paused == null) _paused = false;
		if(_volume == null) _volume = 1.0;
		return this.core.app.audio.loop(_source,_volume,_paused);
	}
	,pause: function(_handle) {
		this.core.app.audio.pause(_handle);
	}
	,unpause: function(_handle) {
		this.core.app.audio.unpause(_handle);
	}
	,stop: function(_handle) {
		this.core.app.audio.stop(_handle);
	}
	,volume: function(_handle,_volume) {
		this.core.app.audio.volume(_handle,_volume);
	}
	,pan: function(_handle,_pan) {
		this.core.app.audio.pan(_handle,_pan);
	}
	,pitch: function(_handle,_pitch) {
		this.core.app.audio.pitch(_handle,_pitch);
	}
	,position: function(_handle,_position) {
		this.core.app.audio.position(_handle,_position);
	}
	,state_of: function(_handle) {
		return this.core.app.audio.state_of(_handle);
	}
	,loop_of: function(_handle) {
		return this.core.app.audio.loop_of(_handle);
	}
	,instance_of: function(_handle) {
		return this.core.app.audio.instance_of(_handle);
	}
	,volume_of: function(_handle) {
		return this.core.app.audio.volume_of(_handle);
	}
	,pan_of: function(_handle) {
		return this.core.app.audio.pan_of(_handle);
	}
	,pitch_of: function(_handle) {
		return this.core.app.audio.pitch_of(_handle);
	}
	,position_of: function(_handle) {
		return this.core.app.audio.position_of(_handle);
	}
	,suspend: function() {
		this.core.app.audio.suspend();
	}
	,resume: function() {
		this.core.app.audio.resume();
	}
	,get_active: function() {
		return this.core.app.audio.active;
	}
	,set_active: function(_val) {
		return this.core.app.audio.active = _val;
	}
	,init: function() {
		null;
	}
	,destroy: function() {
		null;
	}
	,process: function() {
	}
	,__class__: luxe_Audio
	,__properties__: {set_active:"set_active",get_active:"get_active"}
};
var luxe_SizeMode = $hxClasses["luxe.SizeMode"] = { __ename__ : ["luxe","SizeMode"], __constructs__ : ["fit","cover","contain"] };
luxe_SizeMode.fit = ["fit",0];
luxe_SizeMode.fit.toString = $estr;
luxe_SizeMode.fit.__enum__ = luxe_SizeMode;
luxe_SizeMode.cover = ["cover",1];
luxe_SizeMode.cover.toString = $estr;
luxe_SizeMode.cover.__enum__ = luxe_SizeMode;
luxe_SizeMode.contain = ["contain",2];
luxe_SizeMode.contain.toString = $estr;
luxe_SizeMode.contain.__enum__ = luxe_SizeMode;
var luxe_Camera = function(_options) {
	this._connected = false;
	this.minimum_shake = 0.1;
	this.shaking = false;
	this._size_factor = new phoenix_Vector();
	this._rotation_radian = new phoenix_Vector();
	this._rotation_cache = new phoenix_Quaternion();
	this.set_size_mode(luxe_SizeMode.fit);
	var _name = "untitled camera";
	if(_options != null) {
		if(_options.name != null) {
			_name = _options.name;
			_options.camera_name = "" + _name + ".view";
		}
	} else _options = { no_scene : false};
	if(_options.view == null) _options.view = new phoenix_Camera(_options);
	this.view = _options.view;
	luxe_Entity.call(this,{ name : _name, no_scene : _options.no_scene});
	this._final_pos = this.view.pos;
};
$hxClasses["luxe.Camera"] = luxe_Camera;
luxe_Camera.__name__ = ["luxe","Camera"];
luxe_Camera.__super__ = luxe_Entity;
luxe_Camera.prototype = $extend(luxe_Entity.prototype,{
	get_viewport: function() {
		return this.view.viewport;
	}
	,set_viewport: function(_v) {
		return this.view.set_viewport(_v);
	}
	,get_center: function() {
		return this.view.center;
	}
	,set_center: function(_c) {
		this.set_pos(new phoenix_Vector(_c.x - this.get_viewport().w / 2,_c.y - this.get_viewport().h / 2));
		return this.view.set_center(_c);
	}
	,get_minimum_zoom: function() {
		return this.view.minimum_zoom;
	}
	,set_minimum_zoom: function(_m) {
		return this.view.minimum_zoom = _m;
	}
	,get_zoom: function() {
		return this.view.zoom;
	}
	,set_zoom: function(_z) {
		this.view.set_zoom(_z);
		if(this.get_size() != null) {
			var _g = this.view.transform.local.scale;
			_g.set_x(_g.x * (1 / this._size_factor.x));
			var _g1 = this.view.transform.local.scale;
			_g1.set_y(_g1.y * (1 / this._size_factor.y));
		}
		return this.view.zoom;
	}
	,get_size: function() {
		return this.size;
	}
	,get_size_mode: function() {
		return this.size_mode;
	}
	,set_size_mode: function(_m) {
		if(this.get_size_mode() != null) {
			this.size_mode = _m;
			if(this.get_size() != null) this.set_size(this.get_size());
		}
		return this.size_mode = _m;
	}
	,_onwindowsized: function(_event) {
		if(this.get_size() != null) {
			this.set_viewport(new phoenix_Rectangle(this.get_viewport().x,this.get_viewport().y,_event.x,_event.y));
			this.set_size(this.get_size());
		}
	}
	,set_size: function(_size) {
		if(_size == null) {
			this.set_center(new phoenix_Vector(this.get_viewport().w / 2,this.get_viewport().h / 2));
			this.size = _size;
			this._size_factor.set_x(this._size_factor.set_y(1));
			this.set_zoom(this.get_zoom());
			this._connected = false;
			Luxe.off(31,$bind(this,this._onwindowsized));
			return this.get_size();
		}
		if(!this._connected) {
			Luxe.on(31,$bind(this,this._onwindowsized));
			this._connected = true;
		}
		var _ratio_x = this.get_viewport().w / _size.x;
		var _ratio_y = this.get_viewport().h / _size.y;
		var _shortest = Math.max(_ratio_x,_ratio_y);
		var _longest = Math.min(_ratio_x,_ratio_y);
		var _g = this.get_size_mode();
		switch(_g[1]) {
		case 0:
			_ratio_x = _ratio_y = _longest;
			break;
		case 1:
			_ratio_x = _ratio_y = _shortest;
			break;
		case 2:
			break;
		}
		this._size_factor.set_x(_ratio_x);
		this._size_factor.set_y(_ratio_y);
		this.view.transform.local.scale.set_x(1 / (this._size_factor.x * this.get_zoom()));
		this.view.transform.local.scale.set_y(1 / (this._size_factor.y * this.get_zoom()));
		this.set_center(new phoenix_Vector(_size.x / 2,_size.y / 2));
		return this.size = new phoenix_Vector(_size.x,_size.y,_size.z,_size.w);
	}
	,focus: function(_p,_t,_oncomplete) {
		if(_t == null) _t = 0.6;
		var _g = this;
		luxe_tween_Actuate.tween(this.view.center,_t,{ x : _p.x, y : _p.y},true).onComplete(_oncomplete).ease(luxe_tween_easing_Quad.get_easeInOut()).onUpdate(function() {
			_g.get_transform().get_pos().set_xy(_g.view.pos.x,_g.view.pos.y);
		});
	}
	,screen_point_to_world: function(_vector) {
		return this.view.screen_point_to_world(_vector);
	}
	,world_point_to_screen: function(_vector,_viewport) {
		return this.view.world_point_to_screen(_vector,_viewport);
	}
	,set_pos_from_transform: function(_pos) {
		var _vw = this.view.viewport.w;
		var _vh = this.view.viewport.h;
		var _hvw = _vw / 2;
		var _hvh = _vh / 2;
		var _px = _pos.x;
		var _py = _pos.y;
		if(this.bounds != null) {
			if(_px < this.bounds.x) _px = this.bounds.x;
			if(_py < this.bounds.y) _py = this.bounds.y;
			if(_px + _hvw > this.bounds.w - _vw) _px = this.bounds.w - _vw - _hvw;
			if(_py + _hvh > this.bounds.h - _vh) _py = this.bounds.h - _vh - _hvh;
		}
		var _prev = _pos.ignore_listeners;
		_pos.ignore_listeners = true;
		_pos.set_xy(_px,_py);
		_pos.ignore_listeners = _prev;
		luxe_Entity.prototype.set_pos_from_transform.call(this,_pos);
		this.update_view_pos = _pos;
	}
	,set_rotation_from_transform: function(_rotation) {
		luxe_Entity.prototype.set_rotation_from_transform.call(this,_rotation);
		if(this.view != null) this.view.transform.local.set_rotation(_rotation);
	}
	,set_scale_from_transform: function(_scale) {
		luxe_Entity.prototype.set_scale_from_transform.call(this,_scale);
		if(this.view != null) this.view.transform.local.set_scale(_scale);
	}
	,shake: function(_amount) {
		this.shake_amount = _amount;
		this.shaking = true;
	}
	,update: function(dt) {
		if(this.shaking) {
			this._final_pos.set_xyz(this.get_transform().get_pos().x,this.get_transform().get_pos().y,this.get_transform().get_pos().z);
			this.shake_vector = Luxe.utils.geometry.random_point_in_unit_circle();
			var _g = this.shake_vector;
			_g.set_x(_g.x * this.shake_amount);
			var _g1 = this.shake_vector;
			_g1.set_y(_g1.y * this.shake_amount);
			var _g2 = this.shake_vector;
			_g2.set_z(_g2.z * this.shake_amount);
			this.shake_amount *= 0.9;
			if(this.shake_amount <= this.minimum_shake) {
				this.shake_amount = 0;
				this.shaking = false;
			}
			this._final_pos.set_xyz(this._final_pos.x + this.shake_vector.x,this._final_pos.y + this.shake_vector.y,this._final_pos.z + this.shake_vector.z);
			this.update_view_pos = this._final_pos;
		}
		if(this.update_view_pos != null && this.view != null) {
			this.view.set_pos(this.update_view_pos.clone());
			this.update_view_pos = null;
		}
	}
	,init: function() {
		luxe_Entity.prototype.init.call(this);
	}
	,ondestroy: function() {
		luxe_Entity.prototype.ondestroy.call(this);
	}
	,__class__: luxe_Camera
	,__properties__: $extend(luxe_Entity.prototype.__properties__,{set_size_mode:"set_size_mode",get_size_mode:"get_size_mode",set_size:"set_size",get_size:"get_size",set_minimum_zoom:"set_minimum_zoom",get_minimum_zoom:"get_minimum_zoom",set_zoom:"set_zoom",get_zoom:"get_zoom",set_center:"set_center",get_center:"get_center",set_viewport:"set_viewport",get_viewport:"get_viewport"})
});
var luxe_ID = function(_name,_id) {
	if(_id == null) _id = "";
	if(_name == null) _name = "";
	this.name = "";
	this.name = _name;
	if(_id == "") this.id = Luxe.utils.uniqueid(); else this.id = _id;
};
$hxClasses["luxe.ID"] = luxe_ID;
luxe_ID.__name__ = ["luxe","ID"];
luxe_ID.prototype = {
	__class__: luxe_ID
};
var luxe_Component = function(_options) {
	var _name = "";
	if(_options != null) {
		if(_options.name != null) _name = _options.name;
	}
	luxe_ID.call(this,_name == ""?Luxe.utils.uniqueid():_name);
};
$hxClasses["luxe.Component"] = luxe_Component;
luxe_Component.__name__ = ["luxe","Component"];
luxe_Component.__super__ = luxe_ID;
luxe_Component.prototype = $extend(luxe_ID.prototype,{
	init: function() {
	}
	,update: function(dt) {
	}
	,onadded: function() {
	}
	,onremoved: function() {
	}
	,onfixedupdate: function(rate) {
	}
	,onreset: function() {
	}
	,ondestroy: function() {
	}
	,onkeyup: function(event) {
	}
	,onkeydown: function(event) {
	}
	,ontextinput: function(event) {
	}
	,oninputdown: function(event) {
	}
	,oninputup: function(event) {
	}
	,onmousedown: function(event) {
	}
	,onmouseup: function(event) {
	}
	,onmousemove: function(event) {
	}
	,onmousewheel: function(event) {
	}
	,ontouchdown: function(event) {
	}
	,ontouchup: function(event) {
	}
	,ontouchmove: function(event) {
	}
	,ongamepadup: function(event) {
	}
	,ongamepaddown: function(event) {
	}
	,ongamepadaxis: function(event) {
	}
	,ongamepaddevice: function(event) {
	}
	,onwindowmoved: function(event) {
	}
	,onwindowresized: function(event) {
	}
	,onwindowsized: function(event) {
	}
	,onwindowminimized: function(event) {
	}
	,onwindowrestored: function(event) {
	}
	,add: function(component) {
		return this.get_entity().add(component);
	}
	,remove: function(_name) {
		return this.get_entity().remove(_name);
	}
	,get: function(_name,in_children) {
		if(in_children == null) in_children = false;
		return this.get_entity().get(_name,in_children);
	}
	,get_any: function(_name,in_children,first_only) {
		if(first_only == null) first_only = true;
		if(in_children == null) in_children = false;
		return this.get_entity().get_any(_name,in_children,first_only);
	}
	,has: function(_name) {
		return this.get_entity().has(_name);
	}
	,_detach_entity: function() {
		if(this.get_entity() != null) {
		}
	}
	,_attach_entity: function() {
		if(this.get_entity() != null) {
		}
	}
	,set_entity: function(_entity) {
		this._detach_entity();
		this.entity = _entity;
		this._attach_entity();
		return this.get_entity();
	}
	,get_entity: function() {
		return this.entity;
	}
	,set_pos: function(_p) {
		return this.get_entity().get_transform().set_pos(_p);
	}
	,get_pos: function() {
		return this.get_entity().get_transform().get_pos();
	}
	,set_rotation: function(_r) {
		return this.get_entity().get_transform().set_rotation(_r);
	}
	,get_rotation: function() {
		return this.get_entity().get_transform().get_rotation();
	}
	,set_scale: function(_s) {
		return this.get_entity().get_transform().set_scale(_s);
	}
	,get_scale: function() {
		return this.get_entity().get_transform().get_scale();
	}
	,set_origin: function(_o) {
		return this.get_entity().get_transform().set_origin(_o);
	}
	,get_origin: function() {
		return this.get_entity().get_transform().get_origin();
	}
	,set_transform: function(_o) {
		return this.get_entity().set_transform(_o);
	}
	,get_transform: function() {
		return this.get_entity().get_transform();
	}
	,entity_pos_change: function(_pos) {
	}
	,entity_scale_change: function(_scale) {
	}
	,entity_rotation_change: function(_rotation) {
	}
	,entity_origin_change: function(_origin) {
	}
	,entity_parent_change: function(_parent) {
	}
	,toString: function() {
		return "luxe Component: " + this.name + " on " + this.get_entity().get_name() + " / id: " + this.id;
	}
	,__class__: luxe_Component
	,__properties__: {set_origin:"set_origin",get_origin:"get_origin",set_scale:"set_scale",get_scale:"get_scale",set_rotation:"set_rotation",get_rotation:"get_rotation",set_pos:"set_pos",get_pos:"get_pos",set_entity:"set_entity",get_entity:"get_entity"}
});
var snow_App = function() {
	this.next_tick = 0;
	this.fixed_overflow = 0.0;
	this.fixed_frame_time = 0.0167;
	this.fixed_timestep = false;
	this.fixed_alpha = 1.0;
	this.sim_time = 0;
	this.sim_delta = 0.016666666666666666;
	this.frame_max_delta = 0.25;
	this.frame_delta = 0.016666666666666666;
	this.frame_start_prev = 0.0;
	this.frame_start = 0.016666666666666666;
	this.tick_delta = 0.016666666666666666;
	this.tick_start_prev = 0.0;
	this.tick_start = 0.016666666666666666;
	this.update_rate = 0;
	this.fixed_delta = 0;
	this.timescale = 1;
};
$hxClasses["snow.App"] = snow_App;
snow_App.__name__ = ["snow","App"];
snow_App.prototype = {
	config: function(_config) {
		return _config;
	}
	,ready: function() {
	}
	,update: function(dt) {
	}
	,tick: function(dt) {
	}
	,ondestroy: function() {
	}
	,onevent: function(event) {
	}
	,ontickstart: function() {
	}
	,ontickend: function() {
	}
	,onkeydown: function(keycode,scancode,repeat,mod,timestamp,window_id) {
	}
	,onkeyup: function(keycode,scancode,repeat,mod,timestamp,window_id) {
	}
	,ontextinput: function(text,start,length,type,timestamp,window_id) {
	}
	,onmousedown: function(x,y,button,timestamp,window_id) {
	}
	,onmouseup: function(x,y,button,timestamp,window_id) {
	}
	,onmousewheel: function(x,y,timestamp,window_id) {
	}
	,onmousemove: function(x,y,xrel,yrel,timestamp,window_id) {
	}
	,ontouchdown: function(x,y,dx,dy,touch_id,timestamp) {
	}
	,ontouchup: function(x,y,dx,dy,touch_id,timestamp) {
	}
	,ontouchmove: function(x,y,dx,dy,touch_id,timestamp) {
	}
	,ongamepadaxis: function(gamepad,axis,value,timestamp) {
	}
	,ongamepaddown: function(gamepad,button,value,timestamp) {
	}
	,ongamepadup: function(gamepad,button,value,timestamp) {
	}
	,ongamepaddevice: function(gamepad,id,type,timestamp) {
	}
	,internal_init: function() {
		this.sim_time = 0;
		this.fixed_frame_time = 0.016666666666666666;
		this.tick_start = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
		this.tick_start_prev = this.tick_start - this.fixed_frame_time;
		this.tick_delta = this.fixed_frame_time;
		this.frame_start = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
		this.frame_start_prev = this.frame_start - this.fixed_frame_time;
		this.frame_delta = this.sim_delta = this.fixed_frame_time;
	}
	,internal_tick: function() {
		this.ontickstart();
		this.tick_start = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
		this.tick_delta = this.tick_start - this.tick_start_prev;
		this.tick_start_prev = this.tick_start;
		if(this.fixed_timestep) this.internal_tick_fixed_timestep(); else this.internal_tick_default();
		this.tick(this.tick_delta);
		this.ontickend();
	}
	,internal_tick_default: function() {
		if(this.update_rate != 0) {
			if(window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start < this.next_tick) return;
			this.next_tick = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start + this.update_rate;
		}
		this.frame_start = this.tick_start;
		this.frame_delta = this.frame_start - this.frame_start_prev;
		this.frame_start_prev = this.frame_start;
		if(this.frame_delta > this.frame_max_delta) this.frame_delta = this.frame_max_delta;
		var _used_delta;
		if(this.fixed_delta == 0) _used_delta = this.frame_delta; else _used_delta = this.fixed_delta;
		_used_delta *= this.timescale;
		this.sim_delta = _used_delta;
		this.sim_time += _used_delta;
		this.update(_used_delta);
	}
	,internal_tick_fixed_timestep: function() {
		this.frame_start = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
		this.frame_delta = this.frame_start - this.frame_start_prev;
		this.frame_start_prev = this.frame_start;
		this.sim_delta = this.frame_delta * this.timescale;
		if(this.sim_delta > this.frame_max_delta) this.sim_delta = this.frame_max_delta;
		this.fixed_overflow += this.sim_delta;
		var _slice = this.fixed_frame_time * this.timescale;
		while(this.fixed_overflow >= this.fixed_frame_time) {
			this.update(_slice);
			this.sim_time += _slice;
			this.fixed_overflow -= _slice;
		}
		this.fixed_alpha = this.fixed_overflow / this.fixed_frame_time;
	}
	,__class__: snow_App
};
var luxe_Core = function(_game,_config) {
	this.headless = false;
	this.inited = false;
	this.has_shutdown = false;
	this.shutting_down = false;
	this.build = "+e0c3aa7dc7";
	this.version = "dev";
	this.console_visible = false;
	snow_App.call(this);
	this.init_config = _config;
	this.game = _game;
	this.game.app = this;
	this.emitter = new luxe_Emitter();
	Luxe.core = this;
	Luxe.utils = new luxe_utils_Utils(this);
};
$hxClasses["luxe.Core"] = luxe_Core;
luxe_Core.__name__ = ["luxe","Core"];
luxe_Core.__super__ = snow_App;
luxe_Core.prototype = $extend(snow_App.prototype,{
	ready: function() {
		var _g = this;
		this.version = haxe_Resource.getString("version");
		this.build = this.version + haxe_Resource.getString("build");
		haxe_Log.trace("     i / luxe / " + ("" + Luxe.core.build + " / debug:" + Std.string(this.app.debug) + " / os:" + this.app.os + " / platform:" + this.app.platform),{ fileName : "Core.hx", lineNumber : 104, className : "luxe.Core", methodName : "ready"});
		this.headless = this.appconfig.headless;
		if(!this.headless) {
			var _font_name = "default.png";
			var _font_image;
			var bytes = haxe_Resource.getBytes(_font_name);
			_font_image = new Uint8Array(bytes.b.bufferValue);
			var _font_load = snow_systems_assets_AssetImage.load_from_bytes(this.app.assets,_font_name,_font_image);
			_font_load.then(function(asset) {
				_g.init(asset);
			}).error(function(error) {
				haxe_Log.trace("     i / luxe / " + "failed to load default font, things will probably not look right... $error",{ fileName : "Core.hx", lineNumber : 123, className : "luxe.Core", methodName : "ready"});
				_g.init(null);
			});
		} else this.init(null);
	}
	,ondestroy: function() {
		this.shutting_down = true;
		haxe_Log.trace("     i / luxe / " + "shutting down...",{ fileName : "Core.hx", lineNumber : 141, className : "luxe.Core", methodName : "ondestroy"});
		this.game.ondestroy();
		this.emitter.emit(8);
		if(this.renderer != null) this.renderer.destroy();
		this.physics.destroy();
		this.input.destroy();
		this.audio.destroy();
		this.timer.destroy();
		this.events.destroy();
		this.debug.destroy();
		this.emitter = null;
		this.input = null;
		this.audio = null;
		this.events = null;
		this.timer = null;
		this.debug = null;
		Luxe.utils = null;
		this.has_shutdown = true;
		haxe_Log.trace("     i / luxe / " + "goodbye.",{ fileName : "Core.hx", lineNumber : 173, className : "luxe.Core", methodName : "ondestroy"});
	}
	,init: function(asset) {
		Luxe.debug = this.debug = new luxe_Debug(this);
		Luxe.io = this.io = new luxe_IO(this);
		this.draw = new luxe_Draw(this);
		this.timer = new luxe_Timer(this);
		this.events = new luxe_Events();
		this.audio = new luxe_Audio(this);
		this.input = new luxe_Input(this);
		this.physics = new luxe_Physics(this);
		this.resources = new luxe_Resources();
		Luxe.resources = this.resources;
		if(!this.headless) {
			this.renderer = new phoenix_Renderer(this,asset);
			Luxe.renderer = this.renderer;
		}
		var _window_w = this.app.runtime.window.width;
		var _window_h = this.app.runtime.window.height;
		this.screen = new luxe_Screen(this,_window_w,_window_h);
		this.debug.init();
		this.io.init();
		this.timer.init();
		this.audio.init();
		this.input.init();
		if(!this.headless) this.renderer.init();
		this.physics.init();
		Luxe.audio = this.audio;
		Luxe.draw = this.draw;
		Luxe.events = this.events;
		Luxe.timer = this.timer;
		Luxe.input = this.input;
		if(!this.headless) Luxe.camera = new luxe_Camera({ name : "default camera", view : this.renderer.camera});
		Luxe.physics = this.physics;
		this.scene = new luxe_Scene("default scene");
		Luxe.scene = this.scene;
		if(!this.headless) {
			this.scene.add(Luxe.camera);
			this.debug.create_debug_console();
		}
		this.internal_pre_ready();
	}
	,internal_pre_ready: function() {
		if(!this.headless) {
			haxe_Log.trace("     i / luxe / " + ("opengl " + snow_modules_opengl_web_GL.versionString()),{ fileName : "Core.hx", lineNumber : 250, className : "luxe.Core", methodName : "internal_pre_ready"});
			var _default_parcel = new luxe_Parcel({ id : "default_parcel", system : this.resources, bytes : this.appconfig.preload.bytes, texts : this.appconfig.preload.texts, jsons : this.appconfig.preload.jsons, textures : this.appconfig.preload.textures, fonts : this.appconfig.preload.fonts, shaders : this.appconfig.preload.shaders, sounds : this.appconfig.preload.sounds, oncomplete : $bind(this,this.internal_ready), onfailed : function(_error) {
				haxe_Log.trace("     i / luxe / " + "config / preload / failed to load",{ fileName : "Core.hx", lineNumber : 267, className : "luxe.Core", methodName : "internal_pre_ready"});
				throw new js__$Boot_HaxeError(snow_types_Error.error(_error));
			}});
			_default_parcel.load();
		} else this.internal_ready(null);
	}
	,internal_ready: function(_) {
		if(!this.headless) {
			this.debug.start(luxe_Tag.update,50);
			this.debug.start(luxe_Tag.renderdt,50);
		}
		this.game.ready();
		if(!this.shutting_down) {
			this.emitter.emit(2);
			this.inited = true;
			this.physics.reset();
		}
	}
	,shutdown: function() {
		this.shutting_down = true;
		Luxe.next(($_=this.app,$bind($_,$_.shutdown)));
	}
	,on: function(event,handler) {
		this.emitter.on(event,handler);
	}
	,off: function(event,handler) {
		return this.emitter.off(event,handler);
	}
	,emit: function(event,data) {
		this.emitter.emit(event,data);
		return;
	}
	,ontickstart: function() {
		if(!this.has_shutdown) this.emitter.emit(4);
	}
	,ontickend: function() {
		if(!this.has_shutdown) this.emitter.emit(5);
	}
	,onevent: function(event) {
		if(event.window != null) this.window_event(event.window);
		this.game.onevent(event);
		event = null;
	}
	,tick: function(delta) {
		this.render();
	}
	,update: function(dt) {
		if(this.has_shutdown) return;
		if(!this.inited) return;
		this.debug.end(luxe_Tag.update);
		this.debug.start(luxe_Tag.update);
		this.timer.process();
		this.input.process();
		this.audio.process();
		this.events.process();
		this.physics.process();
		this.debug.start(luxe_Tag.updates);
		this.emitter.emit(6,dt);
		this.debug.end(luxe_Tag.updates);
		this.debug.start(luxe_Tag.game_update);
		this.game.update(dt);
		this.debug.end(luxe_Tag.game_update);
		this.debug.process();
	}
	,window_event: function(_event) {
		if(this.shutting_down) return;
		if(!this.inited) return;
		this.emitter.emit(28,_event);
		var _g = _event.type;
		switch(_g) {
		case 4:
			this.emitter.emit(29,_event);
			this.game.onwindowmoved(_event);
			break;
		case 5:
			this.screen.internal_resized(_event.x,_event.y);
			this.renderer.internal_resized(_event.x,_event.y);
			this.emitter.emit(30,_event);
			this.game.onwindowresized(_event);
			break;
		case 6:
			this.screen.internal_resized(_event.x,_event.y);
			this.renderer.internal_resized(_event.x,_event.y);
			this.emitter.emit(31,_event);
			this.game.onwindowsized(_event);
			break;
		case 7:
			this.emitter.emit(32,_event);
			this.game.onwindowminimized(_event);
			break;
		case 9:
			this.emitter.emit(33,_event);
			this.game.onwindowrestored(_event);
			break;
		default:
		}
		_event = null;
	}
	,render: function() {
		if(this.shutting_down) return;
		if(!this.inited) return;
		this.debug.end(luxe_Tag.renderdt);
		this.debug.start(luxe_Tag.renderdt);
		if(!this.headless) {
			this.debug.start(luxe_Tag.render);
			this.emitter.emit(9);
			this.game.onprerender();
			this.emitter.emit(10);
			this.game.onrender();
			this.renderer.process();
			this.emitter.emit(11);
			this.game.onpostrender();
			this.debug.end(luxe_Tag.render);
			var _batch = this.debug.batcher;
			if(_batch.enabled) {
				this.debug.start(luxe_Tag.debug_batch);
				_batch.draw_calls = 0;
				_batch.vert_count = 0;
				_batch.emitter.emit(1,_batch);
				_batch.view.process();
				_batch.renderer.state.viewport(_batch.view.viewport.x,_batch.view.viewport.y,_batch.view.viewport.w,_batch.view.viewport.h);
				_batch.batch(false);
				_batch.emitter.emit(2,_batch);
				this.renderer.stats.geometry_count += _batch.geometry.size();
				this.renderer.stats.dynamic_batched_count += _batch.dynamic_batched_count;
				this.renderer.stats.static_batched_count += _batch.static_batched_count;
				this.renderer.stats.visible_count += _batch.visible_count;
				this.renderer.stats.draw_calls += _batch.draw_calls;
				this.renderer.stats.vert_count += _batch.vert_count;
				this.debug.end(luxe_Tag.debug_batch);
			}
		}
	}
	,show_console: function(_show) {
		if(_show == null) _show = true;
		this.console_visible = _show;
		this.debug.show_console(this.console_visible);
	}
	,onkeydown: function(keycode,scancode,repeat,mod,timestamp,window_id) {
		if(!this.inited) return;
		var _event = { scancode : scancode, keycode : keycode, state : luxe_InteractState.down, mod : mod, repeat : repeat, timestamp : timestamp, window_id : window_id};
		if(!this.shutting_down) {
			this.input.check_named_keys(_event,true);
			this.emitter.emit(12,_event);
			this.game.onkeydown(_event);
			if(scancode == snow_systems_input_Scancodes.grave) this.show_console(!this.console_visible);
		}
		_event = null;
	}
	,onkeyup: function(keycode,scancode,repeat,mod,timestamp,window_id) {
		if(!this.inited) return;
		var _event = { scancode : scancode, keycode : keycode, state : luxe_InteractState.up, mod : mod, repeat : repeat, timestamp : timestamp, window_id : window_id};
		if(!this.shutting_down) {
			this.input.check_named_keys(_event);
			this.emitter.emit(13,_event);
			this.game.onkeyup(_event);
		}
		_event = null;
	}
	,ontextinput: function(text,start,length,type,timestamp,window_id) {
		if(!this.inited) return;
		var _type = luxe_TextEventType.unknown;
		switch(type) {
		case 1:
			_type = luxe_TextEventType.edit;
			break;
		case 2:
			_type = luxe_TextEventType.input;
			break;
		default:
			return;
		}
		var _event = { text : text, start : start, length : length, type : _type, timestamp : timestamp, window_id : window_id};
		if(!this.shutting_down) {
			this.emitter.emit(14,_event);
			this.game.ontextinput(_event);
		}
		_event = null;
	}
	,oninputdown: function(name,event) {
		if(!this.inited) return;
		if(!this.shutting_down) {
			var _ev = { name : name, event : event};
			this.emitter.emit(15,_ev);
			_ev = null;
			this.game.oninputdown(name,event);
		}
		event = null;
	}
	,oninputup: function(name,event) {
		if(!this.inited) return;
		if(!this.shutting_down) {
			var _ev = { name : name, event : event};
			this.emitter.emit(16,_ev);
			_ev = null;
			this.game.oninputup(name,event);
		}
		event = null;
	}
	,onmousedown: function(x,y,button,timestamp,window_id) {
		if(!this.inited) return;
		this.screen.cursor.set_internal(x,y);
		var _event = { timestamp : timestamp, window_id : window_id, state : luxe_InteractState.down, button : button, x : x, y : y, xrel : x, yrel : y, pos : this.screen.cursor.get_pos()};
		if(!this.shutting_down) {
			this.input.check_named_mouse(_event,true);
			this.emitter.emit(17,_event);
			this.game.onmousedown(_event);
		}
		_event = null;
	}
	,onmouseup: function(x,y,button,timestamp,window_id) {
		if(!this.inited) return;
		this.screen.cursor.set_internal(x,y);
		var _event = { timestamp : timestamp, window_id : window_id, state : luxe_InteractState.up, button : button, x : x, y : y, xrel : x, yrel : y, pos : this.screen.cursor.get_pos()};
		if(!this.shutting_down) {
			this.input.check_named_mouse(_event);
			this.emitter.emit(18,_event);
			this.game.onmouseup(_event);
		}
		_event = null;
	}
	,onmousemove: function(x,y,xrel,yrel,timestamp,window_id) {
		if(!this.inited) return;
		this.screen.cursor.set_internal(x,y);
		var _event = { timestamp : timestamp, window_id : window_id, state : luxe_InteractState.move, button : 0, x : x, y : y, xrel : xrel, yrel : yrel, pos : this.screen.cursor.get_pos()};
		if(!this.shutting_down) {
			this.emitter.emit(19,_event);
			this.game.onmousemove(_event);
		}
		_event = null;
	}
	,onmousewheel: function(x,y,timestamp,window_id) {
		if(!this.inited) return;
		var _event = { timestamp : timestamp, window_id : window_id, state : luxe_InteractState.wheel, button : 0, x : Math.floor(x), y : Math.floor(y), xrel : Math.floor(x), yrel : Math.floor(y), pos : this.screen.cursor.get_pos()};
		if(!this.shutting_down) {
			this.input.check_named_mouse(_event,false);
			this.emitter.emit(20,_event);
			this.game.onmousewheel(_event);
		}
		_event = null;
	}
	,ontouchdown: function(x,y,dx,dy,touch_id,timestamp) {
		if(!this.inited) return;
		this._touch_pos = new phoenix_Vector(x,y);
		var _event = { state : luxe_InteractState.down, timestamp : timestamp, touch_id : touch_id, x : x, y : y, dx : x, dy : y, pos : this._touch_pos};
		if(!this.shutting_down) {
			this.emitter.emit(21,_event);
			this.game.ontouchdown(_event);
		}
		_event = null;
	}
	,ontouchup: function(x,y,dx,dy,touch_id,timestamp) {
		if(!this.inited) return;
		this._touch_pos = new phoenix_Vector(x,y);
		var _event = { state : luxe_InteractState.up, timestamp : timestamp, touch_id : touch_id, x : x, y : y, dx : x, dy : y, pos : this._touch_pos};
		if(!this.shutting_down) {
			this.emitter.emit(22,_event);
			this.game.ontouchup(_event);
		}
		_event = null;
	}
	,ontouchmove: function(x,y,dx,dy,touch_id,timestamp) {
		if(!this.inited) return;
		this._touch_pos = new phoenix_Vector(x,y);
		var _event = { state : luxe_InteractState.move, timestamp : timestamp, touch_id : touch_id, x : x, y : y, dx : dx, dy : dy, pos : this._touch_pos};
		if(!this.shutting_down) {
			this.emitter.emit(23,_event);
			this.game.ontouchmove(_event);
		}
		_event = null;
	}
	,ongamepadaxis: function(gamepad,axis,value,timestamp) {
		if(!this.inited) return;
		var _event = { timestamp : timestamp, type : luxe_GamepadEventType.axis, state : luxe_InteractState.axis, gamepad : gamepad, button : -1, axis : axis, value : value, id : null};
		if(!this.shutting_down) {
			this.emitter.emit(24,_event);
			this.game.ongamepadaxis(_event);
		}
		_event = null;
	}
	,ongamepaddown: function(gamepad,button,value,timestamp) {
		if(!this.inited) return;
		var _event = { timestamp : timestamp, type : luxe_GamepadEventType.button, state : luxe_InteractState.down, gamepad : gamepad, button : button, axis : -1, value : value, id : null};
		if(!this.shutting_down) {
			this.input.check_named_gamepad_buttons(_event,true);
			this.emitter.emit(25,_event);
			this.game.ongamepaddown(_event);
		}
		_event = null;
	}
	,ongamepadup: function(gamepad,button,value,timestamp) {
		if(!this.inited) return;
		var _event = { timestamp : timestamp, type : luxe_GamepadEventType.button, state : luxe_InteractState.up, gamepad : gamepad, button : button, axis : -1, value : value, id : null};
		if(!this.shutting_down) {
			this.input.check_named_gamepad_buttons(_event,false);
			this.emitter.emit(26,_event);
			this.game.ongamepadup(_event);
		}
		_event = null;
	}
	,ongamepaddevice: function(gamepad,id,type,timestamp) {
		if(!this.inited) return;
		var _event_type = luxe_GamepadEventType.unknown;
		switch(type) {
		case 1:
			_event_type = luxe_GamepadEventType.device_added;
			break;
		case 2:
			_event_type = luxe_GamepadEventType.device_removed;
			break;
		case 3:
			_event_type = luxe_GamepadEventType.device_remapped;
			break;
		default:
		}
		var _event = { timestamp : timestamp, type : _event_type, state : luxe_InteractState.none, gamepad : gamepad, button : -1, axis : -1, value : 0, id : id};
		if(!this.shutting_down) this.game.ongamepaddevice(_event);
		_event = null;
	}
	,config: function(config) {
		if(config.user == null) config.user = { };
		this.appconfig = config;
		this.appconfig.window.width = this.init_config.window.width;
		this.appconfig.window.height = this.init_config.window.height;
		this.appconfig.window.fullscreen = this.init_config.window.fullscreen;
		this.appconfig.window.borderless = this.init_config.window.borderless;
		this.appconfig.window.resizable = this.init_config.window.resizable;
		this.appconfig.window.title = this.init_config.window.title;
		this.appconfig.headless = this.init_config.headless;
		this.appconfig.preload = { bytes : [], texts : [], jsons : [], textures : [], fonts : [], shaders : [], sounds : []};
		this.appconfig = this.game.config(this.appconfig);
		return this.appconfig;
	}
	,runtime_info: function() {
		return "" + Luxe.core.build + " / debug:" + Std.string(this.app.debug) + " / os:" + this.app.os + " / platform:" + this.app.platform;
	}
	,__class__: luxe_Core
});
var luxe_Tag = function() { };
$hxClasses["luxe.Tag"] = luxe_Tag;
luxe_Tag.__name__ = ["luxe","Tag"];
var luxe_Debug = function(_core) {
	this.last_cursor_grab = false;
	this.profiling = false;
	this.profile_path = "profile.txt";
	this.started = false;
	this.last_view_index = 0;
	this.current_view_index = 0;
	this.dt_average_count = 0;
	this.dt_average_span = 60;
	this.dt_average_accum = 0;
	this.dt_average = 0;
	this.visible = false;
	this.core = _core;
};
$hxClasses["luxe.Debug"] = luxe_Debug;
luxe_Debug.__name__ = ["luxe","Debug"];
luxe_Debug.internal_trace = function(v,inf) {
	var _line = StringTools.rpad(inf.lineNumber == null?"null":"" + inf.lineNumber," ",4);
	console.log("" + inf.fileName + "::" + _line + " " + Std.string(v));
	if(luxe_Debug.shut_down) return;
	var $it0 = luxe_Debug.trace_callbacks.iterator();
	while( $it0.hasNext() ) {
		var _callback = $it0.next();
		_callback(v,inf);
	}
};
luxe_Debug.prototype = {
	init: function() {
		luxe_Debug.trace_callbacks = new haxe_ds_StringMap();
		luxe_Debug.views = [];
		luxe_Debug.views.push(new luxe_debug_TraceDebugView());
		luxe_Debug.views.push(new luxe_debug_StatsDebugView());
		luxe_Debug.views.push(new luxe_debug_ProfilerDebugView());
		luxe_Debug.views.push(new luxe_debug_SceneDebugView());
		this.current_view = luxe_Debug.views[0];
		haxe_Log.trace = luxe_Debug.internal_trace;
		null;
	}
	,get_view: function(_name) {
		var _g = 0;
		var _g1 = luxe_Debug.views;
		while(_g < _g1.length) {
			var view = _g1[_g];
			++_g;
			if(view.get_name() == _name) return view;
		}
		return null;
	}
	,start: function(_name,_max) {
		if(!this.core.appconfig.headless) luxe_debug_ProfilerDebugView.start(_name,_max);
	}
	,end: function(_name) {
		if(!this.core.appconfig.headless) luxe_debug_ProfilerDebugView.end(_name);
	}
	,remove_trace_listener: function(_name) {
		luxe_Debug.trace_callbacks.remove(_name);
	}
	,add_trace_listener: function(_name,_callback) {
		luxe_Debug.trace_callbacks.set(_name,_callback);
	}
	,create_debug_console: function() {
		var _g = this;
		this.core.emitter.on(13,$bind(this,this.keyup));
		this.core.emitter.on(12,$bind(this,this.keydown));
		this.core.emitter.on(18,$bind(this,this.mouseup));
		this.core.emitter.on(17,$bind(this,this.mousedown));
		this.core.emitter.on(19,$bind(this,this.mousemove));
		this.core.emitter.on(20,$bind(this,this.mousewheel));
		this.batcher = new phoenix_Batcher(Luxe.renderer,"debug_batcher",Math.floor(Math.pow(2,20)));
		this.view = new phoenix_Camera({ camera_name : "debug_batcher_camera"});
		this.batcher.view = this.view;
		this.batcher.set_layer(999);
		this.overlay = new phoenix_geometry_QuadGeometry({ id : "debug.overlay", x : 0, y : 0, w : Luxe.core.screen.get_w(), h : Luxe.core.screen.get_h(), color : new phoenix_Color(0,0,0,0.8), depth : 999, visible : false, batcher : this.batcher});
		this.overlay.set_locked(true);
		this.padding = new phoenix_Vector(Luxe.core.screen.get_w() * 0.05,Luxe.core.screen.get_h() * 0.05);
		this.inspector = new luxe_debug_Inspector({ pos : new phoenix_Vector(this.padding.x,this.padding.y), size : new phoenix_Vector(Luxe.core.screen.get_w() - this.padding.x * 2,Luxe.core.screen.get_h() - this.padding.y * 2), batcher : this.batcher});
		this.inspector.onrefresh = $bind(this,this.refresh);
		this.core.emitter.on(31,function(_event) {
			var _w = _event.x;
			var _h = _event.y;
			_g.padding.set_xy(_w * 0.05,_h * 0.05);
			_g.overlay.resize_xy(_w,_h);
			_g.view.set_viewport(new phoenix_Rectangle(0,0,_w,_h));
			_g.inspector.set_size(new phoenix_Vector(_w - _g.padding.x * 2,_h - _g.padding.y * 2));
			_g.inspector.set_pos(new phoenix_Vector(_g.padding.x,_g.padding.y));
			var _g1 = 0;
			var _g2 = luxe_Debug.views;
			while(_g1 < _g2.length) {
				var view = _g2[_g1];
				++_g1;
				view.onwindowsized(_event);
			}
		});
		this.batcher.enabled = false;
		var _g3 = 0;
		var _g11 = luxe_Debug.views;
		while(_g3 < _g11.length) {
			var view1 = _g11[_g3];
			++_g3;
			view1.create();
		}
	}
	,mouseup: function(e) {
		if(this.visible) {
			var _g = 0;
			var _g1 = luxe_Debug.views;
			while(_g < _g1.length) {
				var view = _g1[_g];
				++_g;
				view.onmouseup(e);
			}
		}
	}
	,mousedown: function(e) {
		if(this.visible) {
			var _g = 0;
			var _g1 = luxe_Debug.views;
			while(_g < _g1.length) {
				var view = _g1[_g];
				++_g;
				view.onmousedown(e);
			}
		}
	}
	,mousewheel: function(e) {
		if(this.visible) {
			var _g = 0;
			var _g1 = luxe_Debug.views;
			while(_g < _g1.length) {
				var view = _g1[_g];
				++_g;
				view.onmousewheel(e);
			}
		}
	}
	,mousemove: function(e) {
		if(this.visible) {
			var _g = 0;
			var _g1 = luxe_Debug.views;
			while(_g < _g1.length) {
				var view = _g1[_g];
				++_g;
				view.onmousemove(e);
			}
		}
	}
	,keyup: function(e) {
		if(this.visible) {
			var _g = 0;
			var _g1 = luxe_Debug.views;
			while(_g < _g1.length) {
				var view = _g1[_g];
				++_g;
				view.onkeyup(e);
			}
		}
	}
	,keydown: function(e) {
		if(this.visible) {
			if(e.keycode == 49 && this.core.console_visible) this.switch_view();
			var _g = 0;
			var _g1 = luxe_Debug.views;
			while(_g < _g1.length) {
				var view = _g1[_g];
				++_g;
				view.onkeydown(e);
			}
		}
	}
	,refresh: function() {
		if(this.current_view != null) this.current_view.refresh();
	}
	,switch_view: function() {
		this.last_view_index = this.current_view_index;
		this.current_view_index++;
		if(this.current_view_index > luxe_Debug.views.length - 1) this.current_view_index = 0;
		luxe_Debug.views[this.last_view_index].hide();
		this.current_view = luxe_Debug.views[this.current_view_index];
		this.current_view.show();
	}
	,show_console: function(_show) {
		if(_show == null) _show = true;
		if(_show) {
			this.last_cursor_grab = Luxe.core.screen.cursor.get_grab();
			Luxe.core.screen.cursor.set_grab(false);
		} else if(this.last_cursor_grab != false) Luxe.core.screen.cursor.set_grab(this.last_cursor_grab);
		this.visible = _show;
		this.batcher.enabled = _show;
		if(_show) {
			this.current_view.show();
			this.overlay.set_visible(true);
			this.inspector.show();
		} else {
			this.current_view.hide();
			this.inspector.hide();
			this.overlay.set_visible(false);
		}
	}
	,destroy: function() {
		this.core.emitter.off(13,$bind(this,this.keyup));
		this.core.emitter.off(12,$bind(this,this.keydown));
		this.core.emitter.off(18,$bind(this,this.mouseup));
		this.core.emitter.off(17,$bind(this,this.mousedown));
		this.core.emitter.off(19,$bind(this,this.mousemove));
		this.core.emitter.off(20,$bind(this,this.mousewheel));
		luxe_Debug.shut_down = true;
	}
	,process: function() {
		this.dt_average_accum += Luxe.core.frame_delta;
		this.dt_average_count++;
		if(this.dt_average_count == this.dt_average_span - 1) {
			this.dt_average = this.dt_average_accum / this.dt_average_span;
			this.dt_average_accum = this.dt_average;
			this.dt_average_count = 0;
		}
		if(!this.visible) return;
		this.inspector.title.set_text("[" + this.current_view.get_name() + "] / " + Math.round(1 / this.dt_average) + " / " + luxe_utils_Maths.fixed(Luxe.core.frame_delta,5) + " / " + luxe_utils_Maths.fixed(this.dt_average,5));
		var _g = 0;
		var _g1 = luxe_Debug.views;
		while(_g < _g1.length) {
			var view = _g1[_g];
			++_g;
			view.process();
		}
	}
	,__class__: luxe_Debug
};
var luxe_Draw = function(_core) {
	this.core = _core;
};
$hxClasses["luxe.Draw"] = luxe_Draw;
luxe_Draw.__name__ = ["luxe","Draw"];
luxe_Draw.prototype = {
	line: function(options) {
		if(options.p0 == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("options.p0 was null" + (" ( " + "draw.line requires p0:Vector, and p1:Vector" + " )")));
		if(options.p1 == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("options.p1 was null" + (" ( " + "draw.line requires p0:Vector, and p1:Vector" + " )")));
		if(options.id == null) options.id = "line.geometry";
		options.id;
		if(options.batcher == null) options.batcher = Luxe.renderer.batcher;
		options.batcher;
		return new phoenix_geometry_LineGeometry(options);
	}
	,rectangle: function(options) {
		if(options.id == null) options.id = "rectangle.geometry";
		options.id;
		if(options.batcher == null) options.batcher = Luxe.renderer.batcher;
		options.batcher;
		return new phoenix_geometry_RectangleGeometry(options);
	}
	,box: function(options) {
		if(options.id == null) options.id = "quad.geometry";
		options.id;
		if(options.batcher == null) options.batcher = Luxe.renderer.batcher;
		options.batcher;
		return new phoenix_geometry_QuadGeometry(options);
	}
	,ring: function(options) {
		if(options.id == null) options.id = "ring.geometry";
		options.id;
		if(options.batcher == null) options.batcher = Luxe.renderer.batcher;
		options.batcher;
		return new phoenix_geometry_RingGeometry(options);
	}
	,circle: function(options) {
		if(options.id == null) options.id = "circle.geometry";
		options.id;
		if(options.batcher == null) options.batcher = Luxe.renderer.batcher;
		options.batcher;
		return new phoenix_geometry_CircleGeometry(options);
	}
	,arc: function(options) {
		if(options.id == null) options.id = "arc.geometry";
		options.id;
		if(options.batcher == null) options.batcher = Luxe.renderer.batcher;
		options.batcher;
		return new phoenix_geometry_ArcGeometry(options);
	}
	,ngon: function(options) {
		if(options.id == null) options.id = "ngon.geometry";
		options.id;
		if(options.batcher == null) options.batcher = Luxe.renderer.batcher;
		options.batcher;
		var _sides = 3;
		var _radius = 64;
		var _solid = false;
		var _x = 0;
		var _y = 0;
		var _angle = 0;
		if(options.sides != null) _sides = options.sides;
		if(options.r != null) _radius = options.r;
		if(options.x != null) _x = options.x;
		if(options.y != null) _y = options.y;
		if(options.angle != null) _angle = options.angle;
		if(options.solid != null) _solid = options.solid;
		if(!_solid) options.primitive_type = 1; else options.primitive_type = 6;
		var _geometry = new phoenix_geometry_Geometry(options);
		var _two_pi = 2 * Math.PI;
		var _sides_over_pi = Math.PI / _sides;
		var _sides_over_twopi = _two_pi / _sides;
		var _angle_rad = _angle * 0.017453292519943278;
		var _color = options.color;
		if(_solid) _geometry.add(new phoenix_geometry_Vertex(new phoenix_Vector(_x,_y),_color));
		var _count;
		if(_solid == false) _count = _sides; else _count = _sides + 1;
		var _points = [];
		var _g = 0;
		while(_g < _count) {
			var i = _g++;
			var __x = _radius * Math.sin(_angle_rad + _sides_over_pi + i * _sides_over_twopi);
			var __y = _radius * Math.cos(_angle_rad + _sides_over_pi + i * _sides_over_twopi);
			var __pos = new phoenix_Vector(_x + __x,_y + __y,0);
			_geometry.add(new phoenix_geometry_Vertex(__pos,_color));
			if(!_solid) {
				if(i > 0) {
					var _last = _points[i - 1];
					_geometry.add(new phoenix_geometry_Vertex(__pos,_color));
				}
			}
			_points.push(__pos);
		}
		if(!_solid) _geometry.add(new phoenix_geometry_Vertex(_points[0],_color));
		return _geometry;
	}
	,poly: function(options) {
		if(options.id == null) options.id = "poly.geometry";
		options.id;
		if(options.batcher == null) options.batcher = Luxe.renderer.batcher;
		options.batcher;
		if(options.solid == null) options.solid = true;
		options.solid;
		if(options.close == null) options.close = false;
		options.close;
		var _default_col = null;
		var _has_colors = options.colors != null;
		if(!_has_colors) {
			if(options.color == null) options.color = new phoenix_Color();
			_default_col = options.color;
		}
		if(options.solid) {
			if(options.primitive_type == null) options.primitive_type = 6;
			options.primitive_type;
			var _geometry = new phoenix_geometry_Geometry(options);
			var _idx = 0;
			var _l = options.points.length;
			var _g = 0;
			var _g1 = options.points;
			while(_g < _g1.length) {
				var _point = _g1[_g];
				++_g;
				var _color;
				if(_has_colors) _color = options.colors[_idx]; else _color = _default_col;
				_geometry.add(new phoenix_geometry_Vertex(_point,_color));
				++_idx;
			}
			return _geometry;
		} else {
			if(options.primitive_type == null) options.primitive_type = 1;
			options.primitive_type;
			var _geometry1 = new phoenix_geometry_Geometry(options);
			var _idx1 = 0;
			var _l1 = options.points.length;
			var _g2 = 0;
			var _g11 = options.points;
			while(_g2 < _g11.length) {
				var _point1 = _g11[_g2];
				++_g2;
				var _color1;
				if(_has_colors) _color1 = options.colors[_idx1]; else _color1 = _default_col;
				_geometry1.add(new phoenix_geometry_Vertex(_point1,_color1));
				if(_idx1 < _l1 - 2) {
					var _color_next;
					if(_has_colors) _color_next = options.colors[_idx1 + 1]; else _color_next = _default_col;
					_geometry1.add(new phoenix_geometry_Vertex(options.points[_idx1 + 1],_color_next));
				}
				++_idx1;
			}
			if(options.close) {
				var _last = options.points.length - 1;
				var _color11;
				if(_has_colors) _color11 = options.colors[0]; else _color11 = _default_col;
				var _color2;
				if(_has_colors) _color2 = options.colors[_last]; else _color2 = _default_col;
				_geometry1.add(new phoenix_geometry_Vertex(options.points[_last],_color11));
				_geometry1.add(new phoenix_geometry_Vertex(options.points[0],_color2));
			}
			return _geometry1;
		}
	}
	,texture: function(options) {
		if(options.id == null) options.id = "texture.geometry";
		options.id;
		if(options.batcher == null) options.batcher = Luxe.renderer.batcher;
		options.batcher;
		var _x = 0;
		var _y = 0;
		var _w = 0;
		var _h = 0;
		var _tw = 64;
		var _th = 64;
		if(options.texture != null) {
			_tw = options.texture.width;
			_th = options.texture.height;
			if(options.size == null) {
				_w = _tw;
				_h = _th;
			}
		}
		if(options.pos != null) {
			_x = options.pos.x;
			_y = options.pos.y;
		}
		if(options.size != null) {
			_w = options.size.x;
			_h = options.size.y;
		}
		if(options.x == null) options.x = _x;
		options.x;
		if(options.y == null) options.y = _y;
		options.y;
		if(options.w == null) options.w = _w;
		options.w;
		if(options.h == null) options.h = _h;
		options.h;
		var _quad = new phoenix_geometry_QuadGeometry(options);
		var _ux = 0;
		var _uy = 0;
		var _uw = _tw;
		var _uh = _th;
		if(options.uv != null) {
			_ux = options.uv.x;
			_uy = options.uv.y;
			_uw = options.uv.w;
			_uh = options.uv.h;
		}
		_quad.uv(new phoenix_Rectangle(_ux,_uy,_uw,_uh));
		return _quad;
	}
	,text: function(options) {
		if(options.batcher == null) options.batcher = Luxe.renderer.batcher;
		options.batcher;
		return new phoenix_geometry_TextGeometry(options);
	}
	,__class__: luxe_Draw
};
var luxe_Events = function() {
	this.event_queue_count = 0;
	this.event_connections = new haxe_ds_StringMap();
	this.event_slots = new haxe_ds_StringMap();
	this.event_filters = new haxe_ds_StringMap();
	this.event_queue = [];
	this.event_schedules = new haxe_ds_StringMap();
};
$hxClasses["luxe.Events"] = luxe_Events;
luxe_Events.__name__ = ["luxe","Events"];
luxe_Events.prototype = {
	destroy: function() {
		this.clear();
	}
	,clear: function() {
		var $it0 = this.event_schedules.iterator();
		while( $it0.hasNext() ) {
			var schedule = $it0.next();
			schedule.stop();
			schedule = null;
		}
		var $it1 = this.event_connections.keys();
		while( $it1.hasNext() ) {
			var connection = $it1.next();
			this.event_connections.remove(connection);
		}
		var $it2 = this.event_filters.keys();
		while( $it2.hasNext() ) {
			var filter = $it2.next();
			this.event_filters.remove(filter);
		}
		var $it3 = this.event_slots.keys();
		while( $it3.hasNext() ) {
			var slot = $it3.next();
			this.event_slots.remove(slot);
		}
		var _count = this.event_queue.length;
		while(_count > 0) {
			this.event_queue.pop();
			_count--;
		}
	}
	,does_filter_event: function(_filter,_event) {
		var _replace_stars = new EReg("\\*","gi");
		var _final_filter = _replace_stars.replace(_filter,".*?");
		var _final_search = new EReg(_final_filter,"gi");
		return _final_search.match(_event);
	}
	,listen: function(_event_name,_listener) {
		var _id = Luxe.utils.uniqueid();
		var _connection = new luxe__$Events_EventConnection(_id,_event_name,_listener);
		this.event_connections.set(_id,_connection);
		var _has_stars = new EReg("\\*","gi");
		if(_has_stars.match(_event_name)) {
			if(!this.event_filters.exists(_event_name)) this.event_filters.set(_event_name,[]);
			this.event_filters.get(_event_name).push(_connection);
		} else {
			if(!this.event_slots.exists(_event_name)) this.event_slots.set(_event_name,[]);
			this.event_slots.get(_event_name).push(_connection);
		}
		return _id;
	}
	,unlisten: function(event_id) {
		if(this.event_connections.exists(event_id)) {
			var _connection = this.event_connections.get(event_id);
			var _event_slot = this.event_slots.get(_connection.event_name);
			if(_event_slot != null) {
				HxOverrides.remove(_event_slot,_connection);
				return true;
			} else {
				var _event_filter = this.event_filters.get(_connection.event_name);
				if(_event_filter != null) {
					HxOverrides.remove(_event_filter,_connection);
					return true;
				} else return false;
			}
			return true;
		} else return false;
	}
	,queue: function(event_name,properties) {
		var _id = Luxe.utils.uniqueid();
		this.event_queue.push(new luxe__$Events_EventObject(_id,event_name,properties));
		return _id;
	}
	,dequeue: function(event_id) {
		var _idx = 0;
		var _count = this.event_queue.length;
		do {
			if(this.event_queue[_idx].id == event_id) {
				this.event_queue.splice(_idx,1);
				return true;
			}
			++_idx;
		} while(_idx < _count);
		return false;
	}
	,process: function() {
		var _count = this.event_queue.length;
		while(_count > 0) {
			var _event = this.event_queue.shift();
			this.fire(_event.name,_event.properties);
			_count--;
		}
	}
	,fire: function(_event_name,_properties,_tag) {
		if(_tag == null) _tag = false;
		var _fired = false;
		var $it0 = this.event_filters.iterator();
		while( $it0.hasNext() ) {
			var _filter = $it0.next();
			if(_filter.length > 0) {
				var _filter_name = _filter[0].event_name;
				if(this.does_filter_event(_filter_name,_event_name)) {
					if(_tag) _properties = this.tag_properties(_properties,_event_name,_filter.length);
					var _g = 0;
					while(_g < _filter.length) {
						var _connection = _filter[_g];
						++_g;
						_connection.listener(_properties);
					}
					_fired = true;
				}
			}
		}
		if(this.event_slots.exists(_event_name)) {
			var _connections = this.event_slots.get(_event_name);
			if(_tag) _properties = this.tag_properties(_properties,_event_name,_connections.length);
			var _g1 = 0;
			while(_g1 < _connections.length) {
				var connection = _connections[_g1];
				++_g1;
				connection.listener(_properties);
			}
			_fired = true;
		}
		return _fired;
	}
	,schedule: function(time,event_name,properties) {
		var _id = Luxe.utils.uniqueid();
		var _timer = Luxe.timer.schedule(time,(function(f,a1,a2) {
			return function() {
				return f(a1,a2);
			};
		})($bind(this,this.fire),event_name,properties));
		this.event_schedules.set(_id,_timer);
		return _id;
	}
	,unschedule: function(schedule_id) {
		if(this.event_schedules.exists(schedule_id)) {
			var _timer = this.event_schedules.get(schedule_id);
			_timer.stop();
			this.event_schedules.remove(schedule_id);
			return true;
		}
		return false;
	}
	,tag_properties: function(_properties,_name,_count) {
		if(_properties == null) _properties = { };
		_properties;
		_properties._event_name_ = _name;
		_properties._event_connection_count_ = _count;
		return _properties;
	}
	,__class__: luxe_Events
};
var luxe__$Events_EventConnection = function(_id,_event_name,_listener) {
	this.id = _id;
	this.listener = _listener;
	this.event_name = _event_name;
};
$hxClasses["luxe._Events.EventConnection"] = luxe__$Events_EventConnection;
luxe__$Events_EventConnection.__name__ = ["luxe","_Events","EventConnection"];
luxe__$Events_EventConnection.prototype = {
	__class__: luxe__$Events_EventConnection
};
var luxe__$Events_EventObject = function(_id,_event_name,_event_properties) {
	this.id = _id;
	this.name = _event_name;
	this.properties = _event_properties;
};
$hxClasses["luxe._Events.EventObject"] = luxe__$Events_EventObject;
luxe__$Events_EventObject.__name__ = ["luxe","_Events","EventObject"];
luxe__$Events_EventObject.prototype = {
	__class__: luxe__$Events_EventObject
};
var luxe_IO = function(_core) {
	this.core = _core;
};
$hxClasses["luxe.IO"] = luxe_IO;
luxe_IO.__name__ = ["luxe","IO"];
luxe_IO.prototype = {
	url_open: function(_url) {
		this.core.app.io.module.url_open(_url);
	}
	,string_save: function(_key,_value,_slot) {
		if(_slot == null) _slot = 0;
		return this.core.app.io.string_save(_key,_value,_slot);
	}
	,string_load: function(_key,_slot) {
		if(_slot == null) _slot = 0;
		return this.core.app.io.string_load(_key,_slot);
	}
	,string_destroy: function(_slot) {
		if(_slot == null) _slot = 0;
		return this.core.app.io.string_destroy(_slot);
	}
	,init: function() {
	}
	,__class__: luxe_IO
};
var luxe_InteractState = $hxClasses["luxe.InteractState"] = { __ename__ : ["luxe","InteractState"], __constructs__ : ["unknown","none","down","up","move","wheel","axis"] };
luxe_InteractState.unknown = ["unknown",0];
luxe_InteractState.unknown.toString = $estr;
luxe_InteractState.unknown.__enum__ = luxe_InteractState;
luxe_InteractState.none = ["none",1];
luxe_InteractState.none.toString = $estr;
luxe_InteractState.none.__enum__ = luxe_InteractState;
luxe_InteractState.down = ["down",2];
luxe_InteractState.down.toString = $estr;
luxe_InteractState.down.__enum__ = luxe_InteractState;
luxe_InteractState.up = ["up",3];
luxe_InteractState.up.toString = $estr;
luxe_InteractState.up.__enum__ = luxe_InteractState;
luxe_InteractState.move = ["move",4];
luxe_InteractState.move.toString = $estr;
luxe_InteractState.move.__enum__ = luxe_InteractState;
luxe_InteractState.wheel = ["wheel",5];
luxe_InteractState.wheel.toString = $estr;
luxe_InteractState.wheel.__enum__ = luxe_InteractState;
luxe_InteractState.axis = ["axis",6];
luxe_InteractState.axis.toString = $estr;
luxe_InteractState.axis.__enum__ = luxe_InteractState;
var luxe_TextEventType = $hxClasses["luxe.TextEventType"] = { __ename__ : ["luxe","TextEventType"], __constructs__ : ["unknown","edit","input"] };
luxe_TextEventType.unknown = ["unknown",0];
luxe_TextEventType.unknown.toString = $estr;
luxe_TextEventType.unknown.__enum__ = luxe_TextEventType;
luxe_TextEventType.edit = ["edit",1];
luxe_TextEventType.edit.toString = $estr;
luxe_TextEventType.edit.__enum__ = luxe_TextEventType;
luxe_TextEventType.input = ["input",2];
luxe_TextEventType.input.toString = $estr;
luxe_TextEventType.input.__enum__ = luxe_TextEventType;
var luxe_GamepadEventType = $hxClasses["luxe.GamepadEventType"] = { __ename__ : ["luxe","GamepadEventType"], __constructs__ : ["unknown","axis","button","device_added","device_removed","device_remapped"] };
luxe_GamepadEventType.unknown = ["unknown",0];
luxe_GamepadEventType.unknown.toString = $estr;
luxe_GamepadEventType.unknown.__enum__ = luxe_GamepadEventType;
luxe_GamepadEventType.axis = ["axis",1];
luxe_GamepadEventType.axis.toString = $estr;
luxe_GamepadEventType.axis.__enum__ = luxe_GamepadEventType;
luxe_GamepadEventType.button = ["button",2];
luxe_GamepadEventType.button.toString = $estr;
luxe_GamepadEventType.button.__enum__ = luxe_GamepadEventType;
luxe_GamepadEventType.device_added = ["device_added",3];
luxe_GamepadEventType.device_added.toString = $estr;
luxe_GamepadEventType.device_added.__enum__ = luxe_GamepadEventType;
luxe_GamepadEventType.device_removed = ["device_removed",4];
luxe_GamepadEventType.device_removed.toString = $estr;
luxe_GamepadEventType.device_removed.__enum__ = luxe_GamepadEventType;
luxe_GamepadEventType.device_remapped = ["device_remapped",5];
luxe_GamepadEventType.device_remapped.toString = $estr;
luxe_GamepadEventType.device_remapped.__enum__ = luxe_GamepadEventType;
var luxe_InputType = $hxClasses["luxe.InputType"] = { __ename__ : ["luxe","InputType"], __constructs__ : ["mouse","touch","keys","gamepad"] };
luxe_InputType.mouse = ["mouse",0];
luxe_InputType.mouse.toString = $estr;
luxe_InputType.mouse.__enum__ = luxe_InputType;
luxe_InputType.touch = ["touch",1];
luxe_InputType.touch.toString = $estr;
luxe_InputType.touch.__enum__ = luxe_InputType;
luxe_InputType.keys = ["keys",2];
luxe_InputType.keys.toString = $estr;
luxe_InputType.keys.__enum__ = luxe_InputType;
luxe_InputType.gamepad = ["gamepad",3];
luxe_InputType.gamepad.toString = $estr;
luxe_InputType.gamepad.__enum__ = luxe_InputType;
var luxe_Input = function(_core) {
	this.core = _core;
};
$hxClasses["luxe.Input"] = luxe_Input;
luxe_Input.__name__ = ["luxe","Input"];
luxe_Input.prototype = {
	init: function() {
		this.key_bindings = new haxe_ds_StringMap();
		this.mouse_bindings = new haxe_ds_StringMap();
		this.gamepad_bindings = new haxe_ds_StringMap();
		this._named_input_down = new haxe_ds_StringMap();
		this._named_input_pressed = new haxe_ds_StringMap();
		this._named_input_released = new haxe_ds_StringMap();
		null;
	}
	,destroy: function() {
		null;
	}
	,process: function() {
		var $it0 = this._named_input_pressed.keys();
		while( $it0.hasNext() ) {
			var _event = $it0.next();
			if(this._named_input_pressed.get(_event)) this._named_input_pressed.remove(_event); else this._named_input_pressed.set(_event,true);
		}
		var $it1 = this._named_input_released.keys();
		while( $it1.hasNext() ) {
			var _event1 = $it1.next();
			if(this._named_input_released.get(_event1)) this._named_input_released.remove(_event1); else this._named_input_released.set(_event1,true);
		}
	}
	,inputpressed: function(_event) {
		return this._named_input_pressed.exists(_event);
	}
	,inputreleased: function(_event) {
		return this._named_input_released.exists(_event);
	}
	,inputdown: function(_event) {
		return this._named_input_down.exists(_event);
	}
	,keypressed: function(_code) {
		return this.core.app.input.keypressed(_code);
	}
	,keyreleased: function(_code) {
		return this.core.app.input.keyreleased(_code);
	}
	,keydown: function(_code) {
		return this.core.app.input.keydown(_code);
	}
	,scanpressed: function(_code) {
		return this.core.app.input.scanpressed(_code);
	}
	,scanreleased: function(_code) {
		return this.core.app.input.scanreleased(_code);
	}
	,scandown: function(_code) {
		return this.core.app.input.scandown(_code);
	}
	,mousepressed: function(_button) {
		return this.core.app.input.mousepressed(_button);
	}
	,mousereleased: function(_button) {
		return this.core.app.input.mousereleased(_button);
	}
	,mousedown: function(_button) {
		return this.core.app.input.mousedown(_button);
	}
	,gamepadpressed: function(_gamepad,_button) {
		return this.core.app.input.gamepadpressed(_gamepad,_button);
	}
	,gamepadreleased: function(_gamepad,_button) {
		return this.core.app.input.gamepadreleased(_gamepad,_button);
	}
	,gamepaddown: function(_gamepad,_button) {
		return this.core.app.input.gamepaddown(_gamepad,_button);
	}
	,gamepadaxis: function(_gamepad,_axis) {
		return this.core.app.input.gamepadaxis(_gamepad,_axis);
	}
	,bind_key: function(_name,_key) {
		if(!this.key_bindings.exists(_name)) {
			var value = new haxe_ds_IntMap();
			this.key_bindings.set(_name,value);
		}
		var _kb = this.key_bindings.get(_name);
		_kb.h[_key] = true;
	}
	,bind_mouse: function(_name,_button) {
		if(!this.mouse_bindings.exists(_name)) {
			var value = new haxe_ds_IntMap();
			this.mouse_bindings.set(_name,value);
		}
		var _mb = this.mouse_bindings.get(_name);
		_mb.h[_button] = true;
	}
	,bind_gamepad: function(_name,_gamepad_button,_gamepad_id) {
		if(!this.gamepad_bindings.exists(_name)) {
			var value = new haxe_ds_IntMap();
			this.gamepad_bindings.set(_name,value);
		}
		var _gp = this.gamepad_bindings.get(_name);
		_gp.h[_gamepad_button] = _gamepad_id;
	}
	,check_named_keys: function(e,_down) {
		if(_down == null) _down = false;
		var _fired = [];
		var $it0 = this.key_bindings.keys();
		while( $it0.hasNext() ) {
			var _name = $it0.next();
			var _b = this.key_bindings.get(_name);
			var _is_down_repeat = _down && e.repeat;
			if(_b.h.hasOwnProperty(e.keycode) && !_is_down_repeat) {
				if(!Lambda.has(_fired,_name)) _fired.push(_name);
			}
		}
		var _g = 0;
		while(_g < _fired.length) {
			var _f = _fired[_g];
			++_g;
			if(_down) {
				this._named_input_pressed.set(_f,false);
				this._named_input_down.set(_f,true);
				var _ev = { name : _f, type : luxe_InputType.keys, state : luxe_InteractState.down, key_event : e};
				this.core.oninputdown(_f,_ev);
				_ev = null;
			} else {
				this._named_input_released.set(_f,false);
				this._named_input_down.remove(_f);
				var _ev1 = { name : _f, type : luxe_InputType.keys, state : luxe_InteractState.up, key_event : e};
				this.core.oninputup(_f,_ev1);
				_ev1 = null;
			}
		}
	}
	,check_named_mouse: function(e,_down) {
		if(_down == null) _down = false;
		var _fired = [];
		var $it0 = this.mouse_bindings.keys();
		while( $it0.hasNext() ) {
			var _name = $it0.next();
			var _b = this.mouse_bindings.get(_name);
			if(_b.h.hasOwnProperty(e.button)) {
				if(!Lambda.has(_fired,_name)) _fired.push(_name);
			}
		}
		var _g = 0;
		while(_g < _fired.length) {
			var _f = _fired[_g];
			++_g;
			if(_down) {
				this._named_input_pressed.set(_f,false);
				this._named_input_down.set(_f,true);
				var _ev = { name : _f, type : luxe_InputType.mouse, state : luxe_InteractState.down, mouse_event : e};
				this.core.oninputdown(_f,_ev);
				_ev = null;
			} else {
				this._named_input_released.set(_f,false);
				this._named_input_down.remove(_f);
				var _ev1 = { name : _f, type : luxe_InputType.mouse, state : luxe_InteractState.up, mouse_event : e};
				this.core.oninputup(_f,_ev1);
				_ev1 = null;
			}
		}
	}
	,check_named_gamepad_buttons: function(e,_down) {
		if(_down == null) _down = false;
		var _fired = [];
		var $it0 = this.gamepad_bindings.keys();
		while( $it0.hasNext() ) {
			var _name = $it0.next();
			var _b = this.gamepad_bindings.get(_name);
			if(_b.h.hasOwnProperty(e.button)) {
				var _kb = _b.h[e.button];
				var _accepted_gamepad = _kb == null || _kb == e.gamepad;
				if(!Lambda.has(_fired,_name) && _accepted_gamepad) _fired.push(_name);
			}
		}
		var _g = 0;
		while(_g < _fired.length) {
			var _f = _fired[_g];
			++_g;
			if(_down) {
				this._named_input_pressed.set(_f,false);
				this._named_input_down.set(_f,true);
				var _ev = { name : _f, type : luxe_InputType.gamepad, state : luxe_InteractState.down, gamepad_event : e};
				this.core.oninputdown(_f,_ev);
				_ev = null;
			} else {
				this._named_input_released.set(_f,false);
				this._named_input_down.remove(_f);
				var _ev1 = { name : _f, type : luxe_InputType.gamepad, state : luxe_InteractState.up, gamepad_event : e};
				this.core.oninputup(_f,_ev1);
				_ev1 = null;
			}
		}
	}
	,__class__: luxe_Input
};
var luxe__$Log_LogError = $hxClasses["luxe._Log.LogError"] = { __ename__ : ["luxe","_Log","LogError"], __constructs__ : ["RequireString"] };
luxe__$Log_LogError.RequireString = function(detail) { var $x = ["RequireString",0,detail]; $x.__enum__ = luxe__$Log_LogError; $x.toString = $estr; return $x; };
var luxe_Log = function() { };
$hxClasses["luxe.Log"] = luxe_Log;
luxe_Log.__name__ = ["luxe","Log"];
luxe_Log._get_spacing = function(_file) {
	var _spaces = "";
	var _trace_length = _file.length + 4;
	var _diff = luxe_Log._log_width - _trace_length;
	if(_diff > 0) {
		var _g = 0;
		while(_g < _diff) {
			var i = _g++;
			_spaces += " ";
		}
	}
	return _spaces;
};
var luxe_DebugError = $hxClasses["luxe.DebugError"] = { __ename__ : ["luxe","DebugError"], __constructs__ : ["assertion","null_assertion"] };
luxe_DebugError.assertion = function(expr) { var $x = ["assertion",0,expr]; $x.__enum__ = luxe_DebugError; $x.toString = $estr; return $x; };
luxe_DebugError.null_assertion = function(expr) { var $x = ["null_assertion",1,expr]; $x.__enum__ = luxe_DebugError; $x.toString = $estr; return $x; };
var luxe_NineSlice = function(_options) {
	this.added = false;
	this.midheight = 0.0;
	this.midwidth = 0.0;
	this.is_set = false;
	this.source_h = 0.0;
	this.source_w = 0.0;
	this.source_y = 0.0;
	this.source_x = 0.0;
	this.height = 0.0;
	this.bottom = 32;
	this.width = 0.0;
	this.right = 32;
	this.left = 32;
	this.top = 32;
	this.slices = [];
	if(_options == null) _options = { no_geometry : true}; else _options.no_geometry = true;
	this.nineslice_options = _options;
	if(_options.batcher != null) this._batcher = _options.batcher; else this._batcher = Luxe.renderer.batcher;
	luxe_Visual.call(this,_options);
	if(_options.top != null) this.top = _options.top;
	if(_options.left != null) this.left = _options.left;
	if(_options.right != null) this.right = _options.right;
	if(_options.bottom != null) this.bottom = _options.bottom;
	if(_options.source_x != null) this.source_x = _options.source_x;
	if(_options.source_y != null) this.source_y = _options.source_y;
	if(_options.source_w != null) this.source_w = _options.source_w; else this.source_w = this.texture.width;
	if(_options.source_h != null) this.source_h = _options.source_h; else this.source_h = this.texture.height;
	this.set_geometry(null);
};
$hxClasses["luxe.NineSlice"] = luxe_NineSlice;
luxe_NineSlice.__name__ = ["luxe","NineSlice"];
luxe_NineSlice.__super__ = luxe_Visual;
luxe_NineSlice.prototype = $extend(luxe_Visual.prototype,{
	lock: function() {
		if(this.is_set && this._geometry != null) this._geometry.set_locked(true);
	}
	,dirty: function() {
		if(this.is_set && this._geometry != null) this._geometry.set_dirty(true);
	}
	,update_size: function(_width,_height) {
		this.width = _width;
		this.height = _height;
		this.midwidth = Math.abs(this.width - this.left - this.right);
		this.midheight = Math.abs(this.height - this.top - this.bottom);
		this.slices[0].source_width = this.left;
		this.slices[0].source_height = this.top;
		this.slices[0].source_x = this.source_x;
		this.slices[0].source_y = this.source_y;
		this.slices[0].pos.set_xy(0,0);
		this.slices[0].width = this.left;
		this.slices[0].height = this.top;
		this.slices[1].source_width = this.source_w - this.left - this.right;
		this.slices[1].source_height = this.top;
		this.slices[1].source_x = this.source_x + this.left;
		this.slices[1].source_y = this.source_y;
		this.slices[1].pos.set_xy(this.left,0);
		this.slices[1].width = this.width - this.left - this.right;
		this.slices[1].height = this.top;
		this.slices[2].source_width = this.right;
		this.slices[2].source_height = this.top;
		this.slices[2].source_x = this.source_x + (this.source_w - this.right);
		this.slices[2].source_y = this.source_y;
		this.slices[2].pos.set_xy(this.left + this.midwidth,0);
		this.slices[2].width = this.right;
		this.slices[2].height = this.top;
		this.slices[3].source_width = this.left;
		this.slices[3].source_height = this.source_h - this.top - this.bottom;
		this.slices[3].source_x = this.source_x;
		this.slices[3].source_y = this.source_y + this.top;
		this.slices[3].pos.set_xy(0,this.top);
		this.slices[3].width = this.left;
		this.slices[3].height = this.height - this.top - this.bottom;
		this.slices[4].source_width = this.source_w - this.left - this.right;
		this.slices[4].source_height = this.source_h - this.top - this.bottom;
		this.slices[4].source_x = this.source_x + this.left;
		this.slices[4].source_y = this.source_y + this.top;
		this.slices[4].pos.set_xy(this.left,this.top);
		this.slices[4].width = this.width - this.left - this.right;
		this.slices[4].height = this.height - this.top - this.bottom;
		this.slices[5].source_width = this.right;
		this.slices[5].source_height = this.source_h - this.top - this.bottom;
		this.slices[5].source_x = this.source_x + (this.source_w - this.right);
		this.slices[5].source_y = this.source_y + this.top;
		this.slices[5].pos.set_xy(this.left + this.midwidth,this.top);
		this.slices[5].width = this.right;
		this.slices[5].height = this.height - this.top - this.bottom;
		this.slices[6].source_width = this.left;
		this.slices[6].source_height = this.bottom;
		this.slices[6].source_x = this.source_x;
		this.slices[6].source_y = this.source_y + (this.source_h - this.bottom);
		this.slices[6].pos.set_xy(0,this.top + this.midheight);
		this.slices[6].width = this.left;
		this.slices[6].height = this.bottom;
		this.slices[7].source_width = this.source_w - this.left - this.right;
		this.slices[7].source_height = this.bottom;
		this.slices[7].source_x = this.source_x + this.left;
		this.slices[7].source_y = this.source_y + (this.source_h - this.bottom);
		this.slices[7].pos.set_xy(this.left,this.top + this.midheight);
		this.slices[7].width = this.width - this.left - this.right;
		this.slices[7].height = this.bottom;
		this.slices[8].source_width = this.right;
		this.slices[8].source_height = this.bottom;
		this.slices[8].source_x = this.source_x + (this.source_w - this.right);
		this.slices[8].source_y = this.source_y + (this.source_h - this.bottom);
		this.slices[8].pos.set_xy(this.left + this.midwidth,this.top + this.midheight);
		this.slices[8].width = this.right;
		this.slices[8].height = this.bottom;
	}
	,set: function(_width,_height) {
		if(this.added) {
			this._geometry.drop();
			this.added = false;
		}
		this.slices.splice(0,this.slices.length);
		this.width = _width;
		this.height = _height;
		this.midwidth = Math.abs(this.width - this.left - this.right);
		this.midheight = Math.abs(this.height - this.top - this.bottom);
		this.slices.push({ source_width : this.left, source_height : this.top, source_x : this.source_x, source_y : this.source_y, pos : new phoenix_Vector(0,0), width : this.left, height : this.top, geometry_id : 0});
		this.slices.push({ source_width : this.source_w - this.left - this.right, source_height : this.top, source_x : this.source_x + this.left, source_y : this.source_y, pos : new phoenix_Vector(this.left,0), width : this.width - this.left - this.right, height : this.top, geometry_id : 0});
		this.slices.push({ source_width : this.right, source_height : this.top, source_x : this.source_x + (this.source_w - this.right), source_y : this.source_y, pos : new phoenix_Vector(this.left + this.midwidth,0), width : this.right, height : this.top, geometry_id : 0});
		this.slices.push({ source_width : this.left, source_height : this.source_h - this.top - this.bottom, source_x : this.source_x, source_y : this.source_y + this.top, pos : new phoenix_Vector(0,this.top), width : this.left, height : this.height - this.top - this.bottom, geometry_id : 0});
		this.slices.push({ source_width : this.source_w - this.left - this.right, source_height : this.source_h - this.top - this.bottom, source_x : this.source_x + this.left, source_y : this.source_y + this.top, pos : new phoenix_Vector(this.left,this.top), width : this.width - this.left - this.right, height : this.height - this.top - this.bottom, geometry_id : 0});
		this.slices.push({ source_width : this.right, source_height : this.source_h - this.top - this.bottom, source_x : this.source_x + (this.source_w - this.right), source_y : this.source_y + this.top, pos : new phoenix_Vector(this.left + this.midwidth,this.top), width : this.right, height : this.height - this.top - this.bottom, geometry_id : 0});
		this.slices.push({ source_width : this.left, source_height : this.bottom, source_x : this.source_x, source_y : this.source_y + (this.source_h - this.bottom), pos : new phoenix_Vector(0,this.top + this.midheight), width : this.left, height : this.bottom, geometry_id : 0});
		this.slices.push({ source_width : this.source_w - this.left - this.right, source_height : this.bottom, source_x : this.source_x + this.left, source_y : this.source_y + (this.source_h - this.bottom), pos : new phoenix_Vector(this.left,this.top + this.midheight), width : this.width - this.left - this.right, height : this.bottom, geometry_id : 0});
		this.slices.push({ source_width : this.right, source_height : this.bottom, source_x : this.source_x + (this.source_w - this.right), source_y : this.source_y + (this.source_h - this.bottom), pos : new phoenix_Vector(this.left + this.midwidth,this.top + this.midheight), width : this.right, height : this.bottom, geometry_id : 0});
		this.is_set = true;
	}
	,set_size: function(_v) {
		if(_v == null) return luxe_Visual.prototype.set_size.call(this,_v);
		if(!this.is_set) return luxe_Visual.prototype.set_size.call(this,_v);
		this.update_size(_v.x,_v.y);
		var _g = 0;
		var _g1 = this.slices;
		while(_g < _g1.length) {
			var slice = _g1[_g];
			++_g;
			if(this._geometry != null) this._geometry.quad_resize(slice.geometry_id,new phoenix_Rectangle(slice.pos.x,slice.pos.y,slice.width,slice.height));
		}
		return luxe_Visual.prototype.set_size.call(this,_v);
	}
	,_create: function(_pos,_w,_h,_reset) {
		if(_reset == null) _reset = false;
		if(!this.is_set || _reset) this.set(_w,_h);
		var _color = new phoenix_Color();
		this._geometry = new phoenix_geometry_QuadPackGeometry({ texture : this.texture, color : _color, depth : this.nineslice_options.depth, visible : this.nineslice_options.visible, batcher : this._batcher});
		var _g = 0;
		var _g1 = this.slices;
		while(_g < _g1.length) {
			var slice = _g1[_g];
			++_g;
			slice.geometry_id = this._geometry.quad_add({ x : slice.pos.x, y : slice.pos.y, w : slice.width, h : slice.height, color : this.nineslice_options.color, uv : new phoenix_Rectangle(slice.source_x,slice.source_y,slice.source_width,slice.source_height)});
		}
		this._geometry.id = "NineSlice" + this._geometry.id;
		this.set_geometry(this._geometry);
		this.set_pos(_pos);
		this.added = true;
		this.is_set = true;
	}
	,create: function(_pos,_w,_h,_reset) {
		if(_reset == null) _reset = false;
		if(this.texture != null) this._create(_pos,_w,_h,_reset);
	}
	,init: function() {
		luxe_Visual.prototype.init.call(this);
	}
	,ondestroy: function() {
		luxe_Visual.prototype.ondestroy.call(this);
	}
	,__class__: luxe_NineSlice
});
var luxe_Parcel = function(_options) {
	this.load_start_delay = 0.2;
	this.load_time_spacing = 0.05;
	this.start_load = 0.0;
	this.time_to_load = 0.0;
	if(_options == null) _options = { };
	_options;
	if(_options.system == null) _options.system = Luxe.resources;
	_options.system;
	if(_options.id == null) _options.id = Luxe.utils.uniqueid();
	_options.id;
	if(_options.oncomplete != null) this.oncomplete = _options.oncomplete;
	if(_options.onprogress != null) this.onprogress = _options.onprogress;
	if(_options.onfailed != null) this.onfailed = _options.onfailed;
	if(_options.load_time_spacing != null) this.load_time_spacing = _options.load_time_spacing;
	if(_options.load_start_delay != null) this.load_start_delay = _options.load_start_delay;
	this.state = 0;
	this.loaded = [];
	this.emitter = new luxe_Emitter();
	this.system = _options.system;
	this.id = _options.id;
	this.list = this.empty_list();
	if(_options.bytes != null) this.list.bytes = _options.bytes;
	if(_options.texts != null) this.list.texts = _options.texts;
	if(_options.jsons != null) this.list.jsons = _options.jsons;
	if(_options.textures != null) this.list.textures = _options.textures;
	if(_options.fonts != null) this.list.fonts = _options.fonts;
	if(_options.shaders != null) this.list.shaders = _options.shaders;
	if(_options.sounds != null) this.list.sounds = _options.sounds;
	this.system.track(this);
};
$hxClasses["luxe.Parcel"] = luxe_Parcel;
luxe_Parcel.__name__ = ["luxe","Parcel"];
luxe_Parcel.prototype = {
	on: function(ev,handler) {
		this.emitter.on(ev,handler);
	}
	,off: function(ev,handler) {
		this.emitter.off(ev,handler);
	}
	,emit: function(ev,data) {
		this.emitter.emit(ev,data);
	}
	,is_loaded: function(_id) {
		return HxOverrides.indexOf(this.loaded,_id,0) != -1;
	}
	,load: function(_load_id) {
		var _g = this;
		this.emitter.emit(1,this);
		this.state = 1;
		Luxe.timer.schedule(this.load_start_delay,function() {
			_g.start_load = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
			if(_load_id == null) _load_id = _g.id;
			_load_id;
			if(_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length == 0) {
				_g.state = 2;
				_g.time_to_load = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start - _g.start_load;
				_g.emitter.emit(4,_g);
				if(_g.oncomplete != null) _g.oncomplete(_g);
				return;
			}
			var _index = 0;
			var _load_index = 0;
			var _g1 = 0;
			var _g2 = _g.list.bytes;
			while(_g1 < _g2.length) {
				var _bytes = [_g2[_g1]];
				++_g1;
				++_load_index;
				if(!(HxOverrides.indexOf(_g.loaded,_bytes[0].id,0) != -1)) {
					_g.loaded.push(_bytes[0].id);
					Luxe.timer.schedule(_g.load_time_spacing * _load_index,(function(_bytes) {
						return function() {
							var _item_id = _bytes[0].id;
							var _load = _g.system.load_bytes(_bytes[0].id);
							_load.then((function() {
								return function(_res) {
									_g.one_loaded(_item_id,_load_id,_res,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})(),(function() {
								return function(_err) {
									_g.one_failed(_item_id,_load_id,_err,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})());
						};
					})(_bytes));
				} else {
					haxe_Log.trace("   i / parcel / " + ("" + _g.id + " / already had " + _bytes[0].id + " loaded, skipped"),{ fileName : "Parcel.hx", lineNumber : 202, className : "luxe.Parcel", methodName : "load"});
					_g.one_loaded(_bytes[0].id,_load_id,_g.system.cache.get(_bytes[0].id),++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
				}
			}
			var _g11 = 0;
			var _g21 = _g.list.texts;
			while(_g11 < _g21.length) {
				var _text = [_g21[_g11]];
				++_g11;
				++_load_index;
				if(!(HxOverrides.indexOf(_g.loaded,_text[0].id,0) != -1)) {
					_g.loaded.push(_text[0].id);
					Luxe.timer.schedule(_g.load_time_spacing * _load_index,(function(_text) {
						return function() {
							var _item_id1 = _text[0].id;
							var _load1 = _g.system.load_text(_text[0].id);
							_load1.then((function() {
								return function(_res1) {
									_g.one_loaded(_item_id1,_load_id,_res1,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})(),(function() {
								return function(_err1) {
									_g.one_failed(_item_id1,_load_id,_err1,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})());
						};
					})(_text));
				} else {
					haxe_Log.trace("   i / parcel / " + ("" + _g.id + " / already had " + _text[0].id + " loaded, skipped"),{ fileName : "Parcel.hx", lineNumber : 224, className : "luxe.Parcel", methodName : "load"});
					_g.one_loaded(_text[0].id,_load_id,_g.system.cache.get(_text[0].id),++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
				}
			}
			var _g12 = 0;
			var _g22 = _g.list.jsons;
			while(_g12 < _g22.length) {
				var _json = [_g22[_g12]];
				++_g12;
				++_load_index;
				if(!(HxOverrides.indexOf(_g.loaded,_json[0].id,0) != -1)) {
					_g.loaded.push(_json[0].id);
					Luxe.timer.schedule(_g.load_time_spacing * _load_index,(function(_json) {
						return function() {
							var _item_id2 = _json[0].id;
							var _load2 = _g.system.load_json(_json[0].id);
							_load2.then((function() {
								return function(_res2) {
									_g.one_loaded(_item_id2,_load_id,_res2,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})(),(function() {
								return function(_err2) {
									_g.one_failed(_item_id2,_load_id,_err2,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})());
						};
					})(_json));
				} else {
					haxe_Log.trace("   i / parcel / " + ("" + _g.id + " / already had " + _json[0].id + " loaded, skipped"),{ fileName : "Parcel.hx", lineNumber : 246, className : "luxe.Parcel", methodName : "load"});
					_g.one_loaded(_json[0].id,_load_id,_g.system.cache.get(_json[0].id),++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
				}
			}
			var _g13 = 0;
			var _g23 = _g.list.textures;
			while(_g13 < _g23.length) {
				var _texture = [_g23[_g13]];
				++_g13;
				++_load_index;
				if(!(HxOverrides.indexOf(_g.loaded,_texture[0].id,0) != -1)) {
					_g.loaded.push(_texture[0].id);
					Luxe.timer.schedule(_g.load_time_spacing * _load_index,(function(_texture) {
						return function() {
							var _load3 = _g.system.load_texture(_texture[0].id,{ load_premultiply_alpha : _texture[0].load_premultiply_alpha, filter_min : _texture[0].filter_min, filter_mag : _texture[0].filter_mag, clamp_s : _texture[0].clamp_s, clamp_t : _texture[0].clamp_t});
							var _item_id3 = _texture[0].id;
							_load3.then((function() {
								return function(_res3) {
									_g.one_loaded(_item_id3,_load_id,_res3,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})(),(function() {
								return function(_err3) {
									_g.one_failed(_item_id3,_load_id,_err3,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})());
						};
					})(_texture));
				} else {
					haxe_Log.trace("   i / parcel / " + ("" + _g.id + " / already had " + _texture[0].id + " loaded, skipped"),{ fileName : "Parcel.hx", lineNumber : 276, className : "luxe.Parcel", methodName : "load"});
					_g.one_loaded(_texture[0].id,_load_id,_g.system.cache.get(_texture[0].id),++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
				}
			}
			var _g14 = 0;
			var _g24 = _g.list.fonts;
			while(_g14 < _g24.length) {
				var _font = [_g24[_g14]];
				++_g14;
				++_load_index;
				if(!(HxOverrides.indexOf(_g.loaded,_font[0].id,0) != -1)) {
					_g.loaded.push(_font[0].id);
					Luxe.timer.schedule(_g.load_time_spacing * _load_index,(function(_font) {
						return function() {
							var _load4 = _g.system.load_font(_font[0].id,{ texture_path : _font[0].texture_path});
							var _item_id4 = _font[0].id;
							_load4.then((function() {
								return function(_res4) {
									_g.one_loaded(_item_id4,_load_id,_res4,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})(),(function() {
								return function(_err4) {
									_g.one_failed(_item_id4,_load_id,_err4,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})());
						};
					})(_font));
				} else {
					haxe_Log.trace("   i / parcel / " + ("" + _g.id + " / already had " + _font[0].id + " loaded, skipped"),{ fileName : "Parcel.hx", lineNumber : 302, className : "luxe.Parcel", methodName : "load"});
					_g.one_loaded(_font[0].id,_load_id,_g.system.cache.get(_font[0].id),++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
				}
			}
			var _g15 = 0;
			var _g25 = _g.list.shaders;
			while(_g15 < _g25.length) {
				var _shader = [_g25[_g15]];
				++_g15;
				++_load_index;
				if(!(HxOverrides.indexOf(_g.loaded,_shader[0].id,0) != -1)) {
					_g.loaded.push(_shader[0].id);
					Luxe.timer.schedule(_g.load_time_spacing * _load_index,(function(_shader) {
						return function() {
							var _load5 = _g.system.load_shader(_shader[0].id,{ frag_id : _shader[0].frag_id, vert_id : _shader[0].vert_id});
							var _item_id5 = _shader[0].id;
							_load5.then((function() {
								return function(_res5) {
									_g.one_loaded(_item_id5,_load_id,_res5,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})(),(function() {
								return function(_err5) {
									_g.one_failed(_item_id5,_load_id,_err5,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})());
						};
					})(_shader));
				} else {
					haxe_Log.trace("   i / parcel / " + ("" + _g.id + " / already had " + _shader[0].id + " loaded, skipped"),{ fileName : "Parcel.hx", lineNumber : 329, className : "luxe.Parcel", methodName : "load"});
					_g.one_loaded(_shader[0].id,_load_id,_g.system.cache.get(_shader[0].id),++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
				}
			}
			var _g16 = 0;
			var _g26 = _g.list.sounds;
			while(_g16 < _g26.length) {
				var _sound = [_g26[_g16]];
				++_g16;
				++_load_index;
				if(!(HxOverrides.indexOf(_g.loaded,_sound[0].id,0) != -1)) {
					_g.loaded.push(_sound[0].id);
					Luxe.timer.schedule(_g.load_time_spacing * _load_index,(function(_sound) {
						return function() {
							var _load6 = _g.system.load_audio(_sound[0].id,{ is_stream : _sound[0].is_stream});
							var _item_id6 = _sound[0].id;
							_load6.then((function() {
								return function(_res6) {
									_g.one_loaded(_item_id6,_load_id,_res6,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})(),(function() {
								return function(_err6) {
									_g.one_failed(_item_id6,_load_id,_err6,++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
								};
							})());
						};
					})(_sound));
				} else {
					haxe_Log.trace("   i / parcel / " + ("" + _g.id + " / already had " + _sound[0].id + " loaded, skipped"),{ fileName : "Parcel.hx", lineNumber : 355, className : "luxe.Parcel", methodName : "load"});
					_g.one_loaded(_sound[0].id,_load_id,_g.system.cache.get(_sound[0].id),++_index,_g.list.bytes.length + _g.list.texts.length + _g.list.jsons.length + _g.list.textures.length + _g.list.shaders.length + _g.list.fonts.length + _g.list.sounds.length);
				}
			}
		});
	}
	,unload: function(_empty_list) {
		if(_empty_list == null) _empty_list = false;
		var _g = this;
		this.emitter.emit(2,this);
		var _g1 = 0;
		var _g11 = this.list.bytes;
		while(_g1 < _g11.length) {
			var item = _g11[_g1];
			++_g1;
			var _id = item.id;
			_g.system.destroy(_id);
			HxOverrides.remove(_g.loaded,_id);
		}
		var _g2 = 0;
		var _g12 = this.list.texts;
		while(_g2 < _g12.length) {
			var item1 = _g12[_g2];
			++_g2;
			var _id1 = item1.id;
			_g.system.destroy(_id1);
			HxOverrides.remove(_g.loaded,_id1);
		}
		var _g3 = 0;
		var _g13 = this.list.jsons;
		while(_g3 < _g13.length) {
			var item2 = _g13[_g3];
			++_g3;
			var _id2 = item2.id;
			_g.system.destroy(_id2);
			HxOverrides.remove(_g.loaded,_id2);
		}
		var _g4 = 0;
		var _g14 = this.list.textures;
		while(_g4 < _g14.length) {
			var item3 = _g14[_g4];
			++_g4;
			var _id3 = item3.id;
			_g.system.destroy(_id3);
			HxOverrides.remove(_g.loaded,_id3);
		}
		var _g5 = 0;
		var _g15 = this.list.fonts;
		while(_g5 < _g15.length) {
			var item4 = _g15[_g5];
			++_g5;
			var _id4 = item4.id;
			_g.system.destroy(_id4);
			HxOverrides.remove(_g.loaded,_id4);
		}
		var _g6 = 0;
		var _g16 = this.list.shaders;
		while(_g6 < _g16.length) {
			var item5 = _g16[_g6];
			++_g6;
			var _id5 = item5.id;
			_g.system.destroy(_id5);
			HxOverrides.remove(_g.loaded,_id5);
		}
		var _g7 = 0;
		var _g17 = this.list.sounds;
		while(_g7 < _g17.length) {
			var item6 = _g17[_g7];
			++_g7;
			var _id6 = item6.id;
			_g.system.destroy(_id6);
			HxOverrides.remove(_g.loaded,_id6);
		}
		if(_empty_list) {
			this.list = null;
			this.list = this.empty_list();
		}
		this.state = 0;
	}
	,from_json: function(_json_object) {
		if(_json_object == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_json_object was null" + ""));
		if(_json_object.bytes != null) {
			var _bytes = _json_object.bytes;
			var _g = 0;
			while(_g < _bytes.length) {
				var item = _bytes[_g];
				++_g;
				if(item != null) {
					if(item == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item was null" + ""));
					if(item.id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item.id was null" + ""));
					this.list.bytes.push(item);
				}
			}
		}
		if(_json_object.text != null) {
			var _texts = _json_object.text;
			var _g1 = 0;
			while(_g1 < _texts.length) {
				var item1 = _texts[_g1];
				++_g1;
				if(item1 != null) {
					if(item1 == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item was null" + ""));
					if(item1.id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item.id was null" + ""));
					this.list.texts.push(item1);
				}
			}
		}
		if(_json_object.json != null) {
			var _jsons = _json_object.json;
			var _g2 = 0;
			while(_g2 < _jsons.length) {
				var item2 = _jsons[_g2];
				++_g2;
				if(item2 != null) {
					if(item2 == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item was null" + ""));
					if(item2.id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item.id was null" + ""));
					this.list.jsons.push(item2);
				}
			}
		}
		if(_json_object.textures != null) {
			var _textures = _json_object.textures;
			var _g3 = 0;
			while(_g3 < _textures.length) {
				var item3 = _textures[_g3];
				++_g3;
				if(item3 == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item was null" + ""));
				if(item3.id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item.id was null" + ""));
				this.list.textures.push({ id : item3.id, filter_min : (function($this) {
					var $r;
					var _filter_type = item3.filter_min;
					$r = _filter_type == null?null:(function($this) {
						var $r;
						if(!(_filter_type == "nearest" || _filter_type == "linear")) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_filter_type == 'nearest' || _filter_type == 'linear'" + ""));
						$r = (function($this) {
							var $r;
							switch(_filter_type) {
							case "nearest":
								$r = 9728;
								break;
							case "linear":
								$r = 9729;
								break;
							default:
								$r = null;
							}
							return $r;
						}($this));
						return $r;
					}($this));
					return $r;
				}(this)), filter_mag : (function($this) {
					var $r;
					var _filter_type1 = item3.filter_mag;
					$r = _filter_type1 == null?null:(function($this) {
						var $r;
						if(!(_filter_type1 == "nearest" || _filter_type1 == "linear")) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_filter_type == 'nearest' || _filter_type == 'linear'" + ""));
						$r = (function($this) {
							var $r;
							switch(_filter_type1) {
							case "nearest":
								$r = 9728;
								break;
							case "linear":
								$r = 9729;
								break;
							default:
								$r = null;
							}
							return $r;
						}($this));
						return $r;
					}($this));
					return $r;
				}(this)), clamp_s : (function($this) {
					var $r;
					var _clamp_type = item3.clamp_s;
					$r = _clamp_type == null?null:(function($this) {
						var $r;
						if(!(_clamp_type == "edge" || _clamp_type == "repeat" || _clamp_type == "mirror")) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_clamp_type == 'edge' || _clamp_type == 'repeat' || _clamp_type == 'mirror'" + ""));
						$r = (function($this) {
							var $r;
							switch(_clamp_type) {
							case "edge":
								$r = 33071;
								break;
							case "mirror":
								$r = 33648;
								break;
							case "repeat":
								$r = 10497;
								break;
							default:
								$r = null;
							}
							return $r;
						}($this));
						return $r;
					}($this));
					return $r;
				}(this)), clamp_t : (function($this) {
					var $r;
					var _clamp_type1 = item3.clamp_t;
					$r = _clamp_type1 == null?null:(function($this) {
						var $r;
						if(!(_clamp_type1 == "edge" || _clamp_type1 == "repeat" || _clamp_type1 == "mirror")) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_clamp_type == 'edge' || _clamp_type == 'repeat' || _clamp_type == 'mirror'" + ""));
						$r = (function($this) {
							var $r;
							switch(_clamp_type1) {
							case "edge":
								$r = 33071;
								break;
							case "mirror":
								$r = 33648;
								break;
							case "repeat":
								$r = 10497;
								break;
							default:
								$r = null;
							}
							return $r;
						}($this));
						return $r;
					}($this));
					return $r;
				}(this)), load_premultiply_alpha : item3.load_premultiply_alpha});
			}
		}
		if(_json_object.fonts != null) {
			var _fonts = _json_object.fonts;
			var _g4 = 0;
			while(_g4 < _fonts.length) {
				var item4 = _fonts[_g4];
				++_g4;
				if(item4 != null) {
					if(item4 == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item was null" + ""));
					if(item4.id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item.id was null" + ""));
					this.list.fonts.push(item4);
				}
			}
		}
		if(_json_object.shaders != null) {
			var _shaders = _json_object.shaders;
			var _g5 = 0;
			while(_g5 < _shaders.length) {
				var item5 = _shaders[_g5];
				++_g5;
				if(item5 != null) {
					if(item5 == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item was null" + ""));
					if(item5.id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item.id was null" + ""));
					if(item5.frag_id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item.frag_id was null" + ""));
					if(item5.vert_id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item.vert_id was null" + ""));
					this.list.shaders.push(item5);
				}
			}
		}
		if(_json_object.sounds != null) {
			var _sounds = _json_object.sounds;
			var _g6 = 0;
			while(_g6 < _sounds.length) {
				var item6 = _sounds[_g6];
				++_g6;
				if(item6 != null) {
					if(item6 == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item was null" + ""));
					if(item6.id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("item.id was null" + ""));
					this.list.sounds.push(item6);
				}
			}
		}
	}
	,one_loaded: function(_item_id,_load_id,_resource,_index,_total) {
		var _state = { id : _item_id, load_id : _load_id, resource : _resource, index : _index, total : _total};
		this.emitter.emit(3,_state);
		if(this.onprogress != null) this.onprogress(_state);
		if(_index == _total) {
			this.state = 2;
			this.time_to_load = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start - this.start_load;
			this.emitter.emit(4,this);
			if(this.oncomplete != null) this.oncomplete(this);
		}
	}
	,one_failed: function(_item_id,_load_id,_error,_index,_total) {
		var _state = { id : _item_id, load_id : _load_id, error : _error, index : _index, total : _total};
		this.emitter.emit(5,_state);
		if(this.onfailed != null) this.onfailed(_state);
	}
	,get_listed: function() {
		var _result = [];
		var _g = 0;
		var _g1 = this.list.bytes;
		while(_g < _g1.length) {
			var item = _g1[_g];
			++_g;
			_result.push(item.id);
		}
		var _g2 = 0;
		var _g11 = this.list.texts;
		while(_g2 < _g11.length) {
			var item1 = _g11[_g2];
			++_g2;
			_result.push(item1.id);
		}
		var _g3 = 0;
		var _g12 = this.list.jsons;
		while(_g3 < _g12.length) {
			var item2 = _g12[_g3];
			++_g3;
			_result.push(item2.id);
		}
		var _g4 = 0;
		var _g13 = this.list.textures;
		while(_g4 < _g13.length) {
			var item3 = _g13[_g4];
			++_g4;
			_result.push(item3.id);
		}
		var _g5 = 0;
		var _g14 = this.list.fonts;
		while(_g5 < _g14.length) {
			var item4 = _g14[_g5];
			++_g5;
			_result.push(item4.id);
		}
		var _g6 = 0;
		var _g15 = this.list.shaders;
		while(_g6 < _g15.length) {
			var item5 = _g15[_g6];
			++_g6;
			_result.push(item5.id);
		}
		var _g7 = 0;
		var _g16 = this.list.sounds;
		while(_g7 < _g16.length) {
			var item6 = _g16[_g7];
			++_g7;
			_result.push(item6.id);
		}
		return _result;
	}
	,get_length: function() {
		return this.list.bytes.length + this.list.texts.length + this.list.jsons.length + this.list.textures.length + this.list.shaders.length + this.list.fonts.length + this.list.sounds.length;
	}
	,do_complete: function(_load_id) {
		this.state = 2;
		this.time_to_load = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start - this.start_load;
		this.emitter.emit(4,this);
		if(this.oncomplete != null) this.oncomplete(this);
	}
	,empty_list: function() {
		return { bytes : [], texts : [], jsons : [], textures : [], fonts : [], shaders : [], sounds : []};
	}
	,__class__: luxe_Parcel
	,__properties__: {get_length:"get_length",get_listed:"get_listed"}
};
var luxe_Physics = function(_core) {
	this.step_delta = 0.016666666666666666;
	this.step_rate = 0.016666666666666666;
	this.core = _core;
	this.emitter = new luxe_Emitter();
};
$hxClasses["luxe.Physics"] = luxe_Physics;
luxe_Physics.__name__ = ["luxe","Physics"];
luxe_Physics.prototype = {
	init: function() {
		this.engines = [];
	}
	,reset: function() {
		if(this.timer != null) {
			this.timer.stop();
			this.timer = null;
		}
		if(this.step_rate != 0) this.timer = Luxe.timer.schedule(this.step_rate,$bind(this,this.fixed_update),true);
	}
	,fixed_update: function() {
		Luxe.debug.start(luxe_Physics.tag_physics);
		this.emitter.emit(1,this.step_delta * Luxe.core.timescale);
		this.update();
		this.emitter.emit(2,this.step_delta * Luxe.core.timescale);
		Luxe.debug.end(luxe_Physics.tag_physics);
	}
	,add_engine: function(type,_data) {
		var _engine_instance = Type.createInstance(type,[_data]);
		var _physics_engine = _engine_instance;
		_physics_engine.init();
		this.engines.push(_physics_engine);
		return _engine_instance;
	}
	,update: function() {
		var _g = 0;
		var _g1 = this.engines;
		while(_g < _g1.length) {
			var engine = _g1[_g];
			++_g;
			engine.update();
		}
	}
	,process: function() {
		var _g = 0;
		var _g1 = this.engines;
		while(_g < _g1.length) {
			var engine = _g1[_g];
			++_g;
			engine.process();
		}
	}
	,render: function() {
		var _g = 0;
		var _g1 = this.engines;
		while(_g < _g1.length) {
			var engine = _g1[_g];
			++_g;
			engine.render();
		}
	}
	,destroy: function() {
		if(this.timer != null) this.timer.stop();
		this.timer = null;
		var _g = 0;
		var _g1 = this.engines;
		while(_g < _g1.length) {
			var engine = _g1[_g];
			++_g;
			engine.destroy();
		}
	}
	,on: function(_event,_handler) {
		this.emitter.on(_event,_handler);
	}
	,off: function(_event,_handler) {
		return this.emitter.off(_event,_handler);
	}
	,emit: function(_event,_float) {
		this.emitter.emit(_event,_float);
	}
	,set_step_rate: function(_rate) {
		this.step_rate = _rate;
		this.step_delta = this.step_rate;
		this.reset();
		return this.step_rate;
	}
	,__class__: luxe_Physics
	,__properties__: {set_step_rate:"set_step_rate"}
};
var luxe_PhysicsEngine = function() {
	this.draw = true;
	this.paused = false;
	this.name = "engine";
	this.set_gravity(new phoenix_Vector(0,-9.8,0));
	Luxe.on(10,$bind(this,this._render));
};
$hxClasses["luxe.PhysicsEngine"] = luxe_PhysicsEngine;
luxe_PhysicsEngine.__name__ = ["luxe","PhysicsEngine"];
luxe_PhysicsEngine.prototype = {
	init: function() {
	}
	,_render: function(_) {
		this.render();
	}
	,process: function() {
	}
	,update: function() {
	}
	,render: function() {
	}
	,destroy: function() {
	}
	,get_paused: function() {
		return this.paused;
	}
	,set_paused: function(_pause) {
		return this.paused = _pause;
	}
	,get_draw: function() {
		return this.draw;
	}
	,set_draw: function(_draw) {
		return this.draw = _draw;
	}
	,get_gravity: function() {
		return this.gravity;
	}
	,set_gravity: function(_gravity) {
		return this.gravity = _gravity;
	}
	,__class__: luxe_PhysicsEngine
	,__properties__: {set_draw:"set_draw",get_draw:"get_draw",set_gravity:"set_gravity",get_gravity:"get_gravity",set_paused:"set_paused",get_paused:"get_paused"}
};
var luxe_Resources = function() {
	this.parcels = [];
	this.emitter = new luxe_Emitter();
	this.cache = new haxe_ds_StringMap();
	this.stats = new luxe_ResourceStats();
};
$hxClasses["luxe.Resources"] = luxe_Resources;
luxe_Resources.__name__ = ["luxe","Resources"];
luxe_Resources.prototype = {
	track: function(_cache) {
		if(_cache == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_cache was null" + ""));
		if(!(HxOverrides.indexOf(this.parcels,_cache,0) == -1)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("parcels.indexOf(_cache) == -1" + ""));
		this.parcels.push(_cache);
		this.emit(11,_cache);
	}
	,untrack: function(_cache) {
		if(_cache == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_cache was null" + ""));
		var _removed = HxOverrides.remove(this.parcels,_cache);
		if(_removed) this.emit(12,_cache);
	}
	,add: function(resource) {
		if(!(!this.cache.exists(resource.id))) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("!cache.exists(resource.id)" + ""));
		this.cache.set(resource.id,resource);
		this.emit(2,resource);
		this.update_stats(resource,1);
	}
	,remove: function(resource) {
		if(!this.cache.exists(resource.id)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("cache.exists(resource.id)" + ""));
		this.emit(7,resource);
		this.update_stats(resource,-1);
		return this.cache.remove(resource.id);
	}
	,destroy: function(_id,_force) {
		if(_force == null) _force = false;
		var _resource = this.cache.get(_id);
		if(_resource == null) return false;
		_resource.destroy(_force);
		return true;
	}
	,invalidate: function(_id) {
		var _resource = this.cache.get(_id);
		if(_resource == null) return false;
		_resource.invalidate();
		return true;
	}
	,on: function(ev,handler) {
		this.emitter.on(ev,handler);
	}
	,off: function(ev,handler) {
		this.emitter.off(ev,handler);
	}
	,emit: function(ev,data) {
		this.emitter.emit(1,data);
		this.emitter.emit(ev,data);
	}
	,load_bytes: function(_id) {
		if(_id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_id was null" + ""));
		var _resource = this.cache.get(_id);
		if(_resource != null) {
			var _g = _resource;
			var _g1 = _g.ref;
			_g.set_ref(_g1 + 1);
			_g1;
			return snow_api_Promise.resolve(_resource);
		}
		_resource = new luxe_resource_BytesResource({ id : _id, system : this, asset : null});
		this.add(_resource);
		return _resource.reload();
	}
	,load_text: function(_id) {
		if(_id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_id was null" + ""));
		var _resource = this.cache.get(_id);
		if(_resource != null) {
			var _g = _resource;
			var _g1 = _g.ref;
			_g.set_ref(_g1 + 1);
			_g1;
			return snow_api_Promise.resolve(_resource);
		}
		_resource = new luxe_resource_TextResource({ id : _id, system : this, asset : null});
		this.add(_resource);
		return _resource.reload();
	}
	,load_json: function(_id) {
		if(_id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_id was null" + ""));
		var _resource = this.cache.get(_id);
		if(_resource != null) {
			var _g = _resource;
			var _g1 = _g.ref;
			_g.set_ref(_g1 + 1);
			_g1;
			return snow_api_Promise.resolve(_resource);
		}
		_resource = new luxe_resource_JSONResource({ id : _id, system : this, asset : null});
		this.add(_resource);
		return _resource.reload();
	}
	,load_texture: function(_id,_options) {
		if(_id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_id was null" + ""));
		var _resource = this.cache.get(_id);
		if(_resource != null) {
			var _g = _resource;
			var _g1 = _g.ref;
			_g.set_ref(_g1 + 1);
			_g1;
			return snow_api_Promise.resolve(_resource);
		}
		var _filter_min = null;
		var _filter_mag = null;
		var _clamp_s = null;
		var _clamp_t = null;
		var _premultiply = null;
		if(_options != null) {
			_filter_min = _options.filter_min;
			_filter_mag = _options.filter_mag;
			_clamp_s = _options.clamp_s;
			_clamp_t = _options.clamp_t;
			_premultiply = _options.load_premultiply_alpha;
		}
		_resource = new phoenix_Texture({ id : _id, system : this, filter_min : _filter_min, filter_mag : _filter_mag, clamp_s : _clamp_s, clamp_t : _clamp_t, load_premultiply_alpha : _premultiply});
		this.add(_resource);
		return _resource.reload();
	}
	,load_font: function(_id,_options) {
		if(_id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_id was null" + ""));
		var _resource = this.cache.get(_id);
		if(_resource != null) {
			var _g = _resource;
			var _g1 = _g.ref;
			_g.set_ref(_g1 + 1);
			_g1;
			return snow_api_Promise.resolve(_resource);
		}
		var _texture_path = null;
		if(_options != null) _texture_path = _options.texture_path;
		_resource = new phoenix_BitmapFont({ id : _id, system : this, texture_path : _texture_path});
		this.add(_resource);
		return _resource.reload();
	}
	,load_shader: function(_id,_options) {
		if(_id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_id was null" + ""));
		var _resource = this.cache.get(_id);
		if(_resource != null) {
			var _g = _resource;
			var _g1 = _g.ref;
			_g.set_ref(_g1 + 1);
			_g1;
			return snow_api_Promise.resolve(_resource);
		}
		_resource = new phoenix_Shader({ id : _id, system : this, frag_id : _options.frag_id, vert_id : _options.vert_id});
		this.add(_resource);
		return _resource.reload();
	}
	,load_audio: function(_id,_options) {
		if(_id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_id was null" + ""));
		var _resource = this.cache.get(_id);
		if(_resource != null) {
			var _g = _resource;
			var _g1 = _g.ref;
			_g.set_ref(_g1 + 1);
			_g1;
			return snow_api_Promise.resolve(_resource);
		}
		var _is_stream = false;
		if(_options != null) _is_stream = _options.is_stream;
		_resource = new luxe_resource_AudioResource({ id : _id, system : this, asset : null, is_stream : _is_stream});
		this.add(_resource);
		return _resource.reload();
	}
	,has: function(_id) {
		return this.cache.exists(_id);
	}
	,get: function(_id) {
		return this.cache.get(_id);
	}
	,bytes: function(_id) {
		return this.cache.get(_id);
	}
	,text: function(_id) {
		return this.cache.get(_id);
	}
	,json: function(_id) {
		return this.cache.get(_id);
	}
	,texture: function(_id) {
		return this.cache.get(_id);
	}
	,font: function(_id) {
		return this.cache.get(_id);
	}
	,shader: function(_id) {
		return this.cache.get(_id);
	}
	,audio: function(_id) {
		return this.cache.get(_id);
	}
	,fetch: function(_id) {
		return this.cache.get(_id);
	}
	,update_stats: function(_res,_offset) {
		var _g = _res.resource_type;
		switch(_g) {
		case 0:
			this.stats.unknown += _offset;
			break;
		case 3:
			this.stats.bytes += _offset;
			break;
		case 1:
			this.stats.texts += _offset;
			break;
		case 2:
			this.stats.jsons += _offset;
			break;
		case 4:
			this.stats.textures += _offset;
			break;
		case 5:
			this.stats.rtt += _offset;
			break;
		case 6:
			this.stats.fonts += _offset;
			break;
		case 7:
			this.stats.shaders += _offset;
			break;
		case 8:
			this.stats.audios += _offset;
			break;
		}
		this.stats.total += _offset;
	}
	,__class__: luxe_Resources
};
var luxe_ResourceStats = function() {
	this.unknown = 0;
	this.audios = 0;
	this.bytes = 0;
	this.jsons = 0;
	this.texts = 0;
	this.shaders = 0;
	this.rtt = 0;
	this.textures = 0;
	this.fonts = 0;
	this.total = 0;
};
$hxClasses["luxe.ResourceStats"] = luxe_ResourceStats;
luxe_ResourceStats.__name__ = ["luxe","ResourceStats"];
luxe_ResourceStats.prototype = {
	toString: function() {
		return "Resource Statistics\n" + "\ttotal : " + this.total + "\n" + "\ttexture : " + this.textures + " \n" + "" + "\trender texture : " + this.rtt + " \n" + "\tfont : " + this.fonts + "\n" + "\tshader : " + this.shaders + "\n" + "\ttext : " + this.texts + "\n" + "\tjson : " + this.jsons + "\n" + "\tbytes : " + this.bytes + "\n" + "\taudios : " + this.audios + "\n" + "\tunknown : " + this.unknown;
	}
	,reset: function() {
		this.total = 0;
		this.fonts = 0;
		this.textures = 0;
		this.rtt = 0;
		this.shaders = 0;
		this.texts = 0;
		this.jsons = 0;
		this.bytes = 0;
		this.audios = 0;
		this.unknown = 0;
	}
	,__class__: luxe_ResourceStats
};
var luxe_Scene = function(_name) {
	if(_name == null) _name = "untitled scene";
	this.entity_count = 0;
	this._has_changed = false;
	this.destroyed = false;
	this.length = 0;
	this.started = false;
	this.inited = false;
	luxe_Objects.call(this,_name);
	this.entities = new haxe_ds_StringMap();
	this._delayed_init_entities = [];
	this._delayed_reset_entities = [];
	Luxe.core.emitter.on(2,$bind(this,this.init));
	Luxe.core.emitter.on(8,$bind(this,this._destroy));
	Luxe.core.emitter.on(6,$bind(this,this.update));
	Luxe.core.emitter.on(9,$bind(this,this.prerender));
	Luxe.core.emitter.on(11,$bind(this,this.postrender));
	Luxe.core.emitter.on(10,$bind(this,this.render));
	Luxe.core.emitter.on(12,$bind(this,this.keydown));
	Luxe.core.emitter.on(13,$bind(this,this.keyup));
	Luxe.core.emitter.on(14,$bind(this,this.textinput));
	Luxe.core.emitter.on(16,$bind(this,this.inputup));
	Luxe.core.emitter.on(15,$bind(this,this.inputdown));
	Luxe.core.emitter.on(18,$bind(this,this.mouseup));
	Luxe.core.emitter.on(17,$bind(this,this.mousedown));
	Luxe.core.emitter.on(19,$bind(this,this.mousemove));
	Luxe.core.emitter.on(20,$bind(this,this.mousewheel));
	Luxe.core.emitter.on(22,$bind(this,this.touchup));
	Luxe.core.emitter.on(21,$bind(this,this.touchdown));
	Luxe.core.emitter.on(23,$bind(this,this.touchmove));
	Luxe.core.emitter.on(26,$bind(this,this.gamepadup));
	Luxe.core.emitter.on(25,$bind(this,this.gamepaddown));
	Luxe.core.emitter.on(24,$bind(this,this.gamepadaxis));
	Luxe.core.emitter.on(27,$bind(this,this.gamepaddevice));
	Luxe.core.emitter.on(29,$bind(this,this.windowmoved));
	Luxe.core.emitter.on(30,$bind(this,this.windowresized));
	Luxe.core.emitter.on(31,$bind(this,this.windowsized));
	Luxe.core.emitter.on(32,$bind(this,this.windowminimized));
	Luxe.core.emitter.on(33,$bind(this,this.windowrestored));
	if(Luxe.core.inited) this.init(null);
	var _view = Luxe.core.debug.get_view("Scenes");
	if(_view != null) _view.add_scene(this);
};
$hxClasses["luxe.Scene"] = luxe_Scene;
luxe_Scene.__name__ = ["luxe","Scene"];
luxe_Scene.__super__ = luxe_Objects;
luxe_Scene.prototype = $extend(luxe_Objects.prototype,{
	handle_duplicate_warning: function(_name) {
		if(this.entities.exists(_name)) haxe_Log.trace("    i / scene / " + ("" + this.get_name() + " / adding a second entity named " + _name + "!\r\n                This will replace the existing one, possibly leaving the previous one in limbo."),{ fileName : "Scene.hx", lineNumber : 93, className : "luxe.Scene", methodName : "handle_duplicate_warning"});
	}
	,add: function(entity) {
		if(entity == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("entity was null" + (" ( " + "can't put entity in a scene if the entity is null." + " )")));
		this.handle_duplicate_warning(entity.get_name());
		entity.set_scene(this);
		var key = entity.get_name();
		this.entities.set(key,entity);
		this.entity_count++;
		if(this.inited) this._delayed_init_entities.push(entity);
		if(this.started) this._delayed_reset_entities.push(entity);
		this._has_changed = true;
	}
	,remove: function(entity) {
		if(entity == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("entity was null" + (" ( " + "can't remove entity from a scene if the entity is null." + " )")));
		this._has_changed = true;
		if(entity.get_scene() == this) {
			entity.set_scene(null);
			this.entity_count--;
			var key = entity.get_name();
			return this.entities.remove(key);
		} else {
			haxe_Log.trace("    i / scene / " + ("can't remove the entity(`" + entity.get_name() + "`) from this scene(`" + this.get_name() + "`), it is not mine (entity.scene != this)"),{ fileName : "Scene.hx", lineNumber : 143, className : "luxe.Scene", methodName : "remove"});
			return false;
		}
		return false;
	}
	,get: function(_name) {
		return this.entities.get(_name);
	}
	,empty: function() {
		if(this.entity_count > 0) {
			var $it0 = this.entities.iterator();
			while( $it0.hasNext() ) {
				var entity = $it0.next();
				if(entity != null && entity != Luxe.camera) {
					entity.destroy();
					entity = null;
				}
			}
		}
	}
	,get_named_like: function(_name,into) {
		if(this.entity_count > 0) {
			var _filter = new EReg("^((?:" + _name + ")[.]{1})","g");
			var $it0 = this.entities.iterator();
			while( $it0.hasNext() ) {
				var _entity = $it0.next();
				if(_filter.match(_entity.get_name())) into.push(_entity);
			}
		}
		return into;
	}
	,render: function(_) {
		this.emit(10);
	}
	,prerender: function(_) {
		this.emit(9);
	}
	,postrender: function(_) {
		this.emit(11);
	}
	,keydown: function(e) {
		this.emit(12,e);
	}
	,keyup: function(e) {
		this.emit(13,e);
	}
	,textinput: function(e) {
		this.emit(14,e);
	}
	,mousedown: function(e) {
		this.emit(17,e);
	}
	,mousewheel: function(e) {
		this.emit(20,e);
	}
	,mouseup: function(e) {
		this.emit(18,e);
	}
	,mousemove: function(e) {
		this.emit(19,e);
	}
	,touchdown: function(event) {
		this.emit(21,event);
	}
	,touchup: function(event) {
		this.emit(22,event);
	}
	,touchmove: function(event) {
		this.emit(23,event);
	}
	,gamepadaxis: function(event) {
		this.emit(24,event);
	}
	,gamepadup: function(event) {
		this.emit(26,event);
	}
	,gamepaddown: function(event) {
		this.emit(25,event);
	}
	,gamepaddevice: function(event) {
		this.emit(27,event);
	}
	,windowmoved: function(event) {
		this.emit(29,event);
	}
	,windowresized: function(event) {
		this.emit(30,event);
	}
	,windowsized: function(event) {
		this.emit(31,event);
	}
	,windowminimized: function(event) {
		this.emit(32,event);
	}
	,windowrestored: function(event) {
		this.emit(33,event);
	}
	,inputdown: function(event) {
		this.emit(15,event);
	}
	,inputup: function(event) {
		this.emit(16,event);
	}
	,_destroy: function(_) {
		this.destroy();
	}
	,destroy: function() {
		if(!(this.destroyed == false)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("destroyed == false" + (" ( " + ("scene / destroying repeatedly `" + this.get_name() + "`") + " )")));
		this.destroyed = true;
		Luxe.core.emitter.off(2,$bind(this,this.init));
		Luxe.core.emitter.off(8,$bind(this,this._destroy));
		Luxe.core.emitter.off(6,$bind(this,this.update));
		Luxe.core.emitter.off(9,$bind(this,this.prerender));
		Luxe.core.emitter.off(11,$bind(this,this.postrender));
		Luxe.core.emitter.off(10,$bind(this,this.render));
		Luxe.core.emitter.off(12,$bind(this,this.keydown));
		Luxe.core.emitter.off(13,$bind(this,this.keyup));
		Luxe.core.emitter.off(14,$bind(this,this.textinput));
		Luxe.core.emitter.off(16,$bind(this,this.inputup));
		Luxe.core.emitter.off(15,$bind(this,this.inputdown));
		Luxe.core.emitter.off(18,$bind(this,this.mouseup));
		Luxe.core.emitter.off(17,$bind(this,this.mousedown));
		Luxe.core.emitter.off(19,$bind(this,this.mousemove));
		Luxe.core.emitter.off(20,$bind(this,this.mousewheel));
		Luxe.core.emitter.off(22,$bind(this,this.touchup));
		Luxe.core.emitter.off(21,$bind(this,this.touchdown));
		Luxe.core.emitter.off(23,$bind(this,this.touchmove));
		Luxe.core.emitter.off(26,$bind(this,this.gamepadup));
		Luxe.core.emitter.off(25,$bind(this,this.gamepaddown));
		Luxe.core.emitter.off(24,$bind(this,this.gamepadaxis));
		Luxe.core.emitter.off(27,$bind(this,this.gamepaddevice));
		Luxe.core.emitter.off(29,$bind(this,this.windowmoved));
		Luxe.core.emitter.off(30,$bind(this,this.windowresized));
		Luxe.core.emitter.off(31,$bind(this,this.windowsized));
		Luxe.core.emitter.off(32,$bind(this,this.windowminimized));
		Luxe.core.emitter.off(33,$bind(this,this.windowrestored));
		this.emit(8);
		var _view = Luxe.core.debug.get_view("Scenes");
		if(_view != null) _view.remove_scene(this);
	}
	,_do_init: function() {
		var _before_count = this.get_length();
		if(this.entity_count > 0) {
			var $it0 = this.entities.iterator();
			while( $it0.hasNext() ) {
				var entity = $it0.next();
				if(entity != null) {
					if(!entity.inited) entity._init();
				}
			}
		}
		var _after_count = this.get_length();
		return _before_count != _after_count;
	}
	,init: function(_) {
		var _keep_going = true;
		while(_keep_going) _keep_going = this._do_init();
		this.inited = true;
		this.emit(2);
		this.reset();
	}
	,reset: function() {
		this.started = false;
		this.emit(3);
		this.started = true;
	}
	,update: function(dt) {
		Luxe.core.debug.start("scene." + this.get_name());
		this.handle_delayed_additions();
		this.emit(6,dt);
		if(this.entity_count > 0) {
			var $it0 = this.entities.iterator();
			while( $it0.hasNext() ) {
				var entity = $it0.next();
				if(entity != null) entity._update(dt);
			}
		}
		Luxe.core.debug.end("scene." + this.get_name());
	}
	,handle_delayed_additions: function() {
		if(this._delayed_init_entities.length != 0 || this._delayed_reset_entities.length != 0) null;
		if(this._delayed_init_entities.length > 0) {
			var _g = 0;
			var _g1 = this._delayed_init_entities;
			while(_g < _g1.length) {
				var entity = _g1[_g];
				++_g;
				if(entity.destroyed) continue;
				if(!entity.inited) entity._init(); else null;
			}
			this._delayed_init_entities = null;
			this._delayed_init_entities = [];
		}
		if(this._delayed_reset_entities.length > 0) {
			var _g2 = 0;
			var _g11 = this._delayed_reset_entities;
			while(_g2 < _g11.length) {
				var entity1 = _g11[_g2];
				++_g2;
				if(entity1.destroyed) continue;
				entity1._reset(null);
			}
			this._delayed_reset_entities = null;
			this._delayed_reset_entities = [];
		}
	}
	,get_length: function() {
		return Lambda.count(this.entities);
	}
	,toString: function() {
		return "luxe Scene: " + this.get_name() + " / " + this.get_length() + " entities / id: " + this.get_id();
	}
	,__class__: luxe_Scene
	,__properties__: $extend(luxe_Objects.prototype.__properties__,{get_length:"get_length"})
});
var luxe_Screen = function(_core,_w,_h) {
	this.core = _core;
	this.cursor = new luxe_Cursor(this);
	this.width = _w;
	this.height = _h;
};
$hxClasses["luxe.Screen"] = luxe_Screen;
luxe_Screen.__name__ = ["luxe","Screen"];
luxe_Screen.prototype = {
	toString: function() {
		return "luxe.Screen({ w:" + this.get_w() + ", h:" + this.get_h() + " })";
	}
	,point_inside: function(_p) {
		if(_p.x < 0) return false;
		if(_p.y < 0) return false;
		if(_p.x > this.width) return false;
		if(_p.y > this.height) return false;
		return true;
	}
	,point_inside_xy: function(_x,_y) {
		if(_x < 0) return false;
		if(_y < 0) return false;
		if(_x > this.width) return false;
		if(_y > this.height) return false;
		return true;
	}
	,internal_resized: function(_w,_h) {
		this.width = _w;
		this.height = _h;
	}
	,get_mid: function() {
		return new phoenix_Vector(Math.round(this.get_w() / 2),Math.round(this.get_h() / 2));
	}
	,get_size: function() {
		return new phoenix_Vector(this.get_w(),this.get_h());
	}
	,get_bounds: function() {
		return new phoenix_Rectangle(0,0,this.get_w(),this.get_h());
	}
	,get_w: function() {
		return this.width | 0;
	}
	,get_h: function() {
		return this.height | 0;
	}
	,get_device_pixel_ratio: function() {
		if(window.devicePixelRatio == null) return 1.0; else return window.devicePixelRatio;
	}
	,__class__: luxe_Screen
	,__properties__: {get_device_pixel_ratio:"get_device_pixel_ratio",get_h:"get_h",get_w:"get_w",get_bounds:"get_bounds",get_size:"get_size",get_mid:"get_mid"}
};
var luxe_Cursor = function(_screen) {
	this.ignore = false;
	this.grab = false;
	this.screen = _screen;
	this.pos = new phoenix_Vector();
};
$hxClasses["luxe.Cursor"] = luxe_Cursor;
luxe_Cursor.__name__ = ["luxe","Cursor"];
luxe_Cursor.prototype = {
	set_internal: function(_x,_y) {
		this.ignore = true;
		this.pos = new phoenix_Vector(_x,_y);
		this.ignore = false;
	}
	,get_grab: function() {
		return this.grab;
	}
	,set_grab: function(_grab) {
		this.screen.core.app.runtime.window_grab(_grab);
		return this.grab = _grab;
	}
	,get_pos: function() {
		return this.pos;
	}
	,__class__: luxe_Cursor
	,__properties__: {get_pos:"get_pos",set_grab:"set_grab",get_grab:"get_grab"}
};
var luxe_Sprite = function(options) {
	this.flipy = false;
	this.flipx = false;
	this.centered = true;
	this.set_uv(new phoenix_Rectangle());
	if(options == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("options was null" + (" ( " + "Sprite requires non-null options" + " )")));
	if(options.centered != null) this.set_centered(options.centered);
	if(options.flipx != null) this.set_flipx(options.flipx);
	if(options.flipy != null) this.set_flipy(options.flipy);
	luxe_Visual.call(this,options);
};
$hxClasses["luxe.Sprite"] = luxe_Sprite;
luxe_Sprite.__name__ = ["luxe","Sprite"];
luxe_Sprite.__super__ = luxe_Visual;
luxe_Sprite.prototype = $extend(luxe_Visual.prototype,{
	on_geometry_created: function() {
		luxe_Visual.prototype.on_geometry_created.call(this);
		if(this.texture != null) {
			this.set_uv((function($this) {
				var $r;
				if($this.options.uv == null) $this.options.uv = new phoenix_Rectangle(0,0,$this.texture.width,$this.texture.height);
				$r = $this.options.uv;
				return $r;
			}(this)));
			if(this.texture.resource_type == 5) this.set_flipy(true);
		}
		this.set_centered(!(!this.centered));
		this.set_flipx(!(!this.flipx));
		this.set_flipy(!(!this.flipy));
	}
	,set_geometry: function(_g) {
		this.geometry_quad = _g;
		return luxe_Visual.prototype.set_geometry.call(this,_g);
	}
	,ondestroy: function() {
		this.set_uv(null);
		this.geometry_quad = null;
		luxe_Visual.prototype.ondestroy.call(this);
	}
	,point_inside: function(_p) {
		if(this.geometry == null) return false;
		return Luxe.utils.geometry.point_in_geometry(_p,this.geometry);
	}
	,point_inside_AABB: function(_p) {
		if(this.get_pos() == null) return false;
		if(this.size == null) return false;
		var _s_x = this.size.x * this.get_scale().x;
		var _s_y = this.size.y * this.get_scale().y;
		if(this.centered) {
			var _hx = _s_x / 2;
			var _hy = _s_y / 2;
			if(_p.x < this.get_pos().x - _hx) return false;
			if(_p.y < this.get_pos().y - _hy) return false;
			if(_p.x > this.get_pos().x + _s_x - _hx) return false;
			if(_p.y > this.get_pos().y + _s_y - _hy) return false;
		} else {
			if(_p.x < this.get_pos().x) return false;
			if(_p.y < this.get_pos().y) return false;
			if(_p.x > this.get_pos().x + _s_x) return false;
			if(_p.y > this.get_pos().y + _s_y) return false;
		}
		return true;
	}
	,set_uv: function(_uv) {
		if(_uv == null) return this.uv = _uv;
		if(this.geometry_quad != null) this.geometry_quad.uv(_uv);
		this.uv = _uv;
		phoenix_Rectangle.listen(this.uv,$bind(this,this._uv_change));
		return this.uv;
	}
	,set_flipy: function(_v) {
		if(_v == this.flipy) return this.flipy;
		if(this.geometry_quad != null) this.geometry_quad.set_flipy(_v);
		return this.flipy = _v;
	}
	,set_flipx: function(_v) {
		if(_v == this.flipx) return this.flipx;
		if(this.geometry_quad != null) this.geometry_quad.set_flipx(_v);
		return this.flipx = _v;
	}
	,set_size: function(_v) {
		if(this.geometry_quad != null) {
			this.geometry_quad.resize(new phoenix_Vector(_v.x,_v.y));
			if(!this._has_custom_origin) {
				if(this.centered) this.set_origin(new phoenix_Vector(_v.x,_v.y,_v.z,_v.w).divideScalar(2));
			}
		}
		return luxe_Visual.prototype.set_size.call(this,_v);
	}
	,set_centered: function(_c) {
		if(this.size != null) {
			if(_c) this.set_origin(new phoenix_Vector(this.size.x / 2,this.size.y / 2)); else this.set_origin(new phoenix_Vector());
		}
		return this.centered = _c;
	}
	,_uv_change: function(_v) {
		this.set_uv(this.uv);
	}
	,init: function() {
		luxe_Visual.prototype.init.call(this);
	}
	,__class__: luxe_Sprite
	,__properties__: $extend(luxe_Visual.prototype.__properties__,{set_uv:"set_uv",set_flipy:"set_flipy",set_flipx:"set_flipx",set_centered:"set_centered"})
});
var luxe_Timer = function(_core) {
	this.core = _core;
	this.timers = [];
};
$hxClasses["luxe.Timer"] = luxe_Timer;
luxe_Timer.__name__ = ["luxe","Timer"];
luxe_Timer.prototype = {
	init: function() {
		null;
	}
	,destroy: function() {
		this.reset();
		null;
	}
	,process: function() {
	}
	,reset: function() {
		var _g = 0;
		var _g1 = this.timers;
		while(_g < _g1.length) {
			var t = _g1[_g];
			++_g;
			t.stop();
			t = null;
		}
		this.timers = null;
		this.timers = [];
	}
	,schedule: function(_time_in_seconds,_on_time,repeat) {
		if(repeat == null) repeat = false;
		var _g = this;
		var t = new snow_api_Timer(_time_in_seconds);
		t.run = function() {
			if(!repeat) {
				t.stop();
				HxOverrides.remove(_g.timers,t);
			}
			_on_time();
		};
		this.timers.push(t);
		return t;
	}
	,__class__: luxe_Timer
};
var luxe_components_Components = function(_entity) {
	var _map = new haxe_ds_StringMap();
	this.components = new luxe_structural_OrderedMap_$String_$luxe_$Component(_map);
	this.entity = _entity;
};
$hxClasses["luxe.components.Components"] = luxe_components_Components;
luxe_components_Components.__name__ = ["luxe","components","Components"];
luxe_components_Components.prototype = {
	destroy: function() {
		this.components.map = null;
		this.components = null;
		this.entity = null;
	}
	,add: function(_component) {
		if(_component == null) {
			haxe_Log.trace("attempt to add null component to " + this.entity.get_name(),{ fileName : "Components.hx", lineNumber : 36, className : "luxe.components.Components", methodName : "add"});
			return _component;
		}
		_component.set_entity(this.entity);
		this.components.set(_component.name,_component);
		_component.onadded();
		if(this.entity.inited) _component.init();
		if(this.entity.started) _component.onreset();
		return _component;
	}
	,remove: function(_name) {
		if(!this.components.map.exists(_name)) {
			haxe_Log.trace("attempt to remove " + _name + " from " + this.entity.get_name() + " failed because that component was not attached to this entity",{ fileName : "Components.hx", lineNumber : 69, className : "luxe.components.Components", methodName : "remove"});
			return false;
		}
		var _component = this.components.map.get(_name);
		_component.onremoved();
		_component.set_entity(null);
		return this.components.remove(_name);
	}
	,get: function(_name,in_children) {
		if(in_children == null) in_children = false;
		if(!in_children) return this.components.map.get(_name); else {
			var in_this_entity = this.components.map.get(_name);
			if(in_this_entity != null) return in_this_entity;
			var _g = 0;
			var _g1 = this.entity.children;
			while(_g < _g1.length) {
				var _child = _g1[_g];
				++_g;
				var found = _child._components.get(_name,true);
				if(found != null) return found;
			}
			return null;
		}
		return null;
	}
	,get_any: function(_name,in_children,first_only) {
		if(first_only == null) first_only = true;
		if(in_children == null) in_children = false;
		var results = [];
		if(!in_children) return [this.components.map.get(_name)]; else {
			var in_this_entity = this.components.map.get(_name);
			if(in_this_entity != null) {
				if(first_only) return [in_this_entity]; else results.push(in_this_entity);
			}
			var _g = 0;
			var _g1 = this.entity.children;
			while(_g < _g1.length) {
				var _child = _g1[_g];
				++_g;
				var found = _child._components.get_any(_name,true,first_only);
				if(found != null) {
					if(first_only && found.length > 0) return [found[0]]; else results.concat(found);
				}
			}
		}
		return results;
	}
	,has: function(_name) {
		return this.components.map.exists(_name);
	}
	,__class__: luxe_components_Components
};
var luxe_debug_DebugView = function() {
	this.visible = false;
	luxe_Objects.call(this);
};
$hxClasses["luxe.debug.DebugView"] = luxe_debug_DebugView;
luxe_debug_DebugView.__name__ = ["luxe","debug","DebugView"];
luxe_debug_DebugView.__super__ = luxe_Objects;
luxe_debug_DebugView.prototype = $extend(luxe_Objects.prototype,{
	refresh: function() {
	}
	,process: function() {
	}
	,onmousedown: function(e) {
	}
	,onmousewheel: function(e) {
	}
	,onmouseup: function(e) {
	}
	,onmousemove: function(e) {
	}
	,onkeydown: function(e) {
	}
	,onkeyup: function(e) {
	}
	,onwindowsized: function(e) {
	}
	,create: function() {
	}
	,show: function() {
		this.visible = true;
	}
	,hide: function() {
		this.visible = false;
	}
	,__class__: luxe_debug_DebugView
});
var luxe_debug_BatcherDebugView = function() {
	this.as_immediate = false;
	this.dragging = false;
	luxe_debug_DebugView.call(this);
	this.set_name("Batcher Debug");
};
$hxClasses["luxe.debug.BatcherDebugView"] = luxe_debug_BatcherDebugView;
luxe_debug_BatcherDebugView.__name__ = ["luxe","debug","BatcherDebugView"];
luxe_debug_BatcherDebugView.__super__ = luxe_debug_DebugView;
luxe_debug_BatcherDebugView.prototype = $extend(luxe_debug_DebugView.prototype,{
	create: function() {
		this.batcher = Luxe.renderer.create_batcher({ name : "debug_batcher_view", camera : new phoenix_Camera({ camera_name : "batcher_debug_view"}), layer : 1000});
	}
	,refresh: function() {
		this.clear_batcher_tree();
		this.draw_batcher_tree();
	}
	,onmousedown: function(e) {
		this.dragmstart = e.pos.clone();
		this.dragstart = this.batcher.view.pos.clone();
		this.dragging = true;
	}
	,onmouseup: function(e) {
		this.dragging = false;
	}
	,onmousemove: function(e) {
		if(this.dragging) {
			var diff = phoenix_Vector.Subtract(e.pos,this.dragmstart);
			this.batcher.view.set_pos(phoenix_Vector.Subtract(this.dragstart,diff));
		}
	}
	,onmousewheel: function(e) {
		if(e.y < 0) {
			var _g = this.batcher.view;
			_g.set_zoom(_g.zoom - 0.1);
		} else {
			var _g1 = this.batcher.view;
			_g1.set_zoom(_g1.zoom + 0.1);
		}
	}
	,clear_batcher_tree: function() {
		if(this._tree_geom != null) {
			var _g = 0;
			var _g1 = this._tree_geom;
			while(_g < _g1.length) {
				var _g2 = _g1[_g];
				++_g;
				_g2.drop();
				_g2 = null;
			}
			this._tree_geom = null;
		}
	}
	,keystr: function(key,key2) {
		return "ts: " + key.timestamp + "\n" + "seq: " + key.sequence + "\n" + "primitive_type: " + key.primitive_type + " " + key.primitive_type + "\n" + "texture: " + (key.texture == null?"null":Std.string(key.texture.texture)) + "\n" + "texture id: " + (key.texture == null?"null":key.texture.id) + "\n" + "shader: " + (key.shader == null?"null":key.shader.id) + "\n" + "depth: " + key.depth + "\n" + "clip: " + (key.clip == null?"null":"" + key.clip);
	}
	,draw_geom_node: function(l,_leaf,_p,_bbw) {
		if(_bbw == null) _bbw = 20;
		var _bw = 128;
		var _bwhalf = _bw / 2;
		var _bh = 128;
		var _g = _leaf.value;
		var c = new phoenix_Color(1,1,1,0.4).rgb(16777215);
		if(_g.dropped) c = new phoenix_Color(1,1,1,1).rgb(13369344);
		this._tree_geom.push(Luxe.draw.rectangle({ immediate : this.as_immediate, x : _p.x - _bwhalf, y : _p.y, w : _bw, h : _bh, color : c, batcher : this.batcher, depth : 999.4}));
		this._tree_geom.push(Luxe.draw.text({ immediate : this.as_immediate, bounds : new phoenix_Rectangle(_p.x - _bwhalf,_p.y,_bw,_bh), point_size : 13, color : c, batcher : this.batcher, depth : 999.4, text : this.keystr(_leaf.key,_g.key), align : 2, align_vertical : 2}));
		var t = new phoenix_Vector(_p.x,_p.y,_p.z,_p.w).set_xy(_p.x,_p.y - 16);
		var t2 = new phoenix_Vector(_p.x,_p.y,_p.z,_p.w).set_xy(_p.x,_p.y + _bw + 2);
		var talign = 2;
		this._tree_geom.push(Luxe.draw.text({ immediate : this.as_immediate, pos : t, point_size : 13, color : c, batcher : this.batcher, depth : 999.4, text : _g.id, align : talign}));
		var c2 = new phoenix_Color(1,1,1,0.4).rgb(16750916);
		var notes_l = "none";
		var notes_r = "none";
		if(_leaf.left != null) {
			notes_l = "node";
			var compare = Luxe.renderer.batcher.compare_rule(_leaf.key,_leaf.left.key);
			notes_l = Luxe.renderer.batcher.compare_rule_to_string(compare);
		}
		if(_leaf.right != null) {
			notes_r = "node";
			var compare1 = Luxe.renderer.batcher.compare_rule(_leaf.key,_leaf.right.key);
			notes_r = Luxe.renderer.batcher.compare_rule_to_string(compare1);
		}
		this._tree_geom.push(Luxe.draw.text({ immediate : this.as_immediate, pos : t2, point_size : 13, color : c2, batcher : this.batcher, depth : 999.4, text : notes_l + " / " + notes_r, align : talign}));
	}
	,draw_geom_leaf: function(L,_leaf,_p) {
		if(_leaf == null) return;
		var _bw = _leaf.nodecount / 20;
		var _bwb = _leaf.nodecount * 25;
		var _bh = 128;
		var _bh2 = 148;
		var _bwhalf = _bw / 2;
		var c = new phoenix_Color(1,1,1,0.4).rgb(16777215);
		if(_leaf != null) {
			this.draw_geom_node(L,_leaf,_p,_bw);
			if(_leaf.left != null) {
				if(Luxe.renderer.batcher.geometry_compare(_leaf.left.key,_leaf.key) < 0) c = new phoenix_Color(1,1,1,1).rgb(52224); else c = new phoenix_Color(1,1,1,1).rgb(13369344);
				this._tree_geom.push(Luxe.draw.line({ immediate : this.as_immediate, p0 : new phoenix_Vector(_p.x - _bwhalf,_p.y + _bh), p1 : new phoenix_Vector(_p.x - _bwb,_p.y + _bh2), color : c, batcher : this.batcher, depth : 999.4}));
				this.draw_geom_leaf(true,_leaf.left,new phoenix_Vector(_p.x - _bwb,_p.y + _bh2));
			}
			if(_leaf.right != null) {
				if(Luxe.renderer.batcher.geometry_compare(_leaf.right.key,_leaf.key) > 0) c = new phoenix_Color(1,1,1,1).rgb(52224); else c = new phoenix_Color(1,1,1,1).rgb(13369344);
				this._tree_geom.push(Luxe.draw.line({ immediate : this.as_immediate, p0 : new phoenix_Vector(_p.x + _bwhalf,_p.y + _bh), p1 : new phoenix_Vector(_p.x + _bwb,_p.y + _bh2), color : c, batcher : this.batcher, depth : 999.4}));
				this.draw_geom_leaf(false,_leaf.right,new phoenix_Vector(_p.x + _bwb,_p.y + _bh2));
			}
		}
	}
	,draw_batcher_tree: function() {
		this._tree_geom = null;
		this._tree_geom = [];
		var _p = new phoenix_Vector(Luxe.core.screen.get_w() / 2,Luxe.debug.padding.y * 2 + 10);
		var _node = Luxe.renderer.batcher.geometry.root;
		this.draw_geom_leaf(true,_node,_p);
	}
	,process: function() {
		if(this.visible) {
			if(Luxe.renderer.batcher.tree_changed) this.refresh();
		}
	}
	,show: function() {
		luxe_debug_DebugView.prototype.show.call(this);
		this.refresh();
	}
	,hide: function() {
		luxe_debug_DebugView.prototype.hide.call(this);
		this.clear_batcher_tree();
	}
	,__class__: luxe_debug_BatcherDebugView
});
var luxe_debug_Inspector = function(_options) {
	this.set_size(new phoenix_Vector(Std["int"](Luxe.core.screen.get_w() * 0.2),Std["int"](Luxe.core.screen.get_h() * 0.6)));
	this.set_pos(new phoenix_Vector(Luxe.core.screen.get_w() / 2 - this.size.x / 2,Luxe.core.screen.get_h() / 2 - this.size.y / 2));
	this.batcher = Luxe.renderer.batcher;
	if(_options != null) {
		if(_options.batcher != null) this.batcher = _options.batcher;
		if(_options.size != null) this.set_size(_options.size);
		if(_options.pos != null) this.set_pos(_options.pos);
	}
};
$hxClasses["luxe.debug.Inspector"] = luxe_debug_Inspector;
luxe_debug_Inspector.__name__ = ["luxe","debug","Inspector"];
luxe_debug_Inspector.prototype = {
	refresh: function() {
		if(this.window == null) this.create_window();
		if(this.onrefresh != null) this.onrefresh();
	}
	,show: function() {
		this.refresh();
		this.window.set_visible(true);
		this.title.set_visible(true);
		this.version.set_visible(true);
	}
	,hide: function() {
		this.window.set_visible(false);
		this.title.set_visible(false);
		this.version.set_visible(false);
	}
	,set_size: function(_size) {
		if(_size != null && this.window != null) {
			this.window.set_size(_size);
			this.window.geometry.set_dirty(true);
		}
		if(this.version != null) this.version.set_pos(new phoenix_Vector(this.pos.x + (_size.x - 14),this.pos.y + 6));
		return this.size = _size;
	}
	,set_pos: function(_pos) {
		if(_pos != null && this.window != null) {
			this.window.set_pos(_pos);
			this.window.geometry.set_dirty(true);
		}
		if(this.title != null) this.title.set_pos(new phoenix_Vector(_pos.x + 14,_pos.y + 6));
		if(this.version != null) this.version.set_pos(new phoenix_Vector(_pos.x + (this.size.x - 14),_pos.y + 6));
		return this.pos = _pos;
	}
	,create_window: function() {
		this.window = new luxe_Sprite({ name : "debug.window", batcher : this.batcher, no_scene : true, depth : 999.1, visible : false, color : new phoenix_Color().rgb(1447449), centered : false, size : this.size, pos : this.pos});
		this.title = new luxe_Text({ name : "debug.title", batcher : this.batcher, no_scene : true, depth : 999.2, visible : false, color : new phoenix_Color().rgb(16121979), pos : new phoenix_Vector(this.pos.x + 14,this.pos.y + 6), text : "Inspector", point_size : 15, align : 0});
		this.version = new luxe_Text({ name : "debug.version", batcher : this.batcher, no_scene : true, depth : 999.2, visible : false, color : new phoenix_Color().rgb(5526617), pos : new phoenix_Vector(this.pos.x + (this.size.x - 14),this.pos.y + 6), text : "" + Luxe.core.runtime_info(), point_size : 13, align : 1});
		this.window.set_locked(true);
		this.window.geometry.id = "debug.Inspector";
		this.title.geometry.id = "debug.title.text";
		this.version.geometry.id = "debug.version.text";
	}
	,__class__: luxe_debug_Inspector
	,__properties__: {set_size:"set_size",set_pos:"set_pos"}
};
var phoenix_Color = function(_r,_g,_b,_a) {
	if(_a == null) _a = 1.0;
	if(_b == null) _b = 1.0;
	if(_g == null) _g = 1.0;
	if(_r == null) _r = 1.0;
	this.refreshing = false;
	this.is_hsv = false;
	this.is_hsl = false;
	this.a = 1.0;
	this.b = 1.0;
	this.g = 1.0;
	this.r = 1.0;
	this.set_r(_r);
	this.set_g(_g);
	this.set_b(_b);
	this.a = _a;
};
$hxClasses["phoenix.Color"] = phoenix_Color;
phoenix_Color.__name__ = ["phoenix","Color"];
phoenix_Color.random = function(_include_alpha) {
	if(_include_alpha == null) _include_alpha = false;
	return new phoenix_Color(Math.random(),Math.random(),Math.random(),_include_alpha?Math.random():1.0);
};
phoenix_Color.prototype = {
	set_r: function(_r) {
		this.r = _r;
		if(!this.refreshing) {
			if(this.is_hsl) {
				var colorhsl = this;
				colorhsl.fromColor(this);
			} else if(this.is_hsv) {
				var colorhsv = this;
				colorhsv.fromColor(this);
			}
		}
		return this.r;
	}
	,set_g: function(_g) {
		this.g = _g;
		if(!this.refreshing) {
			if(this.is_hsl) {
				var colorhsl = this;
				colorhsl.fromColor(this);
			} else if(this.is_hsv) {
				var colorhsv = this;
				colorhsv.fromColor(this);
			}
		}
		return this.g;
	}
	,set_b: function(_b) {
		this.b = _b;
		if(!this.refreshing) {
			if(this.is_hsl) {
				var colorhsl = this;
				colorhsl.fromColor(this);
			} else if(this.is_hsv) {
				var colorhsv = this;
				colorhsv.fromColor(this);
			}
		}
		return this.b;
	}
	,set: function(_r,_g,_b,_a) {
		var _setr = this.r;
		var _setg = this.g;
		var _setb = this.b;
		var _seta = this.a;
		if(_r != null) _setr = _r;
		if(_g != null) _setg = _g;
		if(_b != null) _setb = _b;
		if(_a != null) _seta = _a;
		this.set_r(_setr);
		this.set_g(_setg);
		this.set_b(_setb);
		this.a = _seta;
		return this;
	}
	,maxRGB: function() {
		return Math.max(this.r,Math.max(this.g,this.b));
	}
	,minRGB: function() {
		return Math.min(this.r,Math.min(this.g,this.b));
	}
	,tween: function(_time_in_seconds,_properties_to_tween,_override) {
		if(_override == null) _override = true;
		if(_time_in_seconds == null) _time_in_seconds = 0.5;
		if(_properties_to_tween != null) {
			var _dest_r = this.r;
			var _dest_g = this.g;
			var _dest_b = this.b;
			var _dest_a = this.a;
			var _change_r = false;
			var _change_g = false;
			var _change_b = false;
			var _change_a = false;
			if(js_Boot.__instanceof(_properties_to_tween,phoenix_Color)) {
				_dest_r = _properties_to_tween.r;
				_dest_g = _properties_to_tween.g;
				_dest_b = _properties_to_tween.b;
				_dest_a = _properties_to_tween.a;
				_change_r = true;
				_change_g = true;
				_change_b = true;
				_change_a = true;
			} else {
				if(_properties_to_tween.r != null) {
					_dest_r = _properties_to_tween.r;
					_change_r = true;
				}
				if(_properties_to_tween.g != null) {
					_dest_g = _properties_to_tween.g;
					_change_g = true;
				}
				if(_properties_to_tween.b != null) {
					_dest_b = _properties_to_tween.b;
					_change_b = true;
				}
				if(_properties_to_tween.a != null) {
					_dest_a = _properties_to_tween.a;
					_change_a = true;
				}
			}
			var _properties = { };
			if(_change_r) _properties.r = _dest_r;
			if(_change_g) _properties.g = _dest_g;
			if(_change_b) _properties.b = _dest_b;
			if(_change_a) _properties.a = _dest_a;
			return luxe_tween_Actuate.tween(this,_time_in_seconds,_properties,_override);
		} else throw new js__$Boot_HaxeError(" Warning: Color.tween passed a null destination ");
	}
	,clone: function() {
		return new phoenix_Color(this.r,this.g,this.b,this.a);
	}
	,rgb: function(_rgb) {
		if(_rgb == null) _rgb = 16777215;
		this.from_int(_rgb);
		return this;
	}
	,toColorHSL: function() {
		return new phoenix_ColorHSL().fromColor(this);
	}
	,toColorHSV: function() {
		return new phoenix_ColorHSV().fromColor(this);
	}
	,fromColorHSV: function(_color_hsv) {
		var d = _color_hsv.h % 360 / 60;
		if(d < 0) d += 6;
		var hf = Math.floor(d);
		var hi = hf % 6;
		var f = d - hf;
		var v = _color_hsv.v;
		var p = _color_hsv.v * (1 - _color_hsv.s);
		var q = _color_hsv.v * (1 - f * _color_hsv.s);
		var t = _color_hsv.v * (1 - (1 - f) * _color_hsv.s);
		switch(hi) {
		case 0:
			this.set_r(v);
			this.set_g(t);
			this.set_b(p);
			break;
		case 1:
			this.set_r(q);
			this.set_g(v);
			this.set_b(p);
			break;
		case 2:
			this.set_r(p);
			this.set_g(v);
			this.set_b(t);
			break;
		case 3:
			this.set_r(p);
			this.set_g(q);
			this.set_b(v);
			break;
		case 4:
			this.set_r(t);
			this.set_g(p);
			this.set_b(v);
			break;
		case 5:
			this.set_r(v);
			this.set_g(p);
			this.set_b(q);
			break;
		}
		this.a = _color_hsv.a;
	}
	,fromColorHSL: function(_color_hsl) {
		var q = 1;
		if(_color_hsl.l < 0.5) q = _color_hsl.l * (1 + _color_hsl.s); else q = _color_hsl.l + _color_hsl.s - _color_hsl.l * _color_hsl.s;
		var p = 2 * _color_hsl.l - q;
		var hk = _color_hsl.h % 360 / 360;
		var tr = hk + 0.33333333333333331;
		var tg = hk;
		var tb = hk - 0.33333333333333331;
		var tc = [tr,tg,tb];
		var _g1 = 0;
		var _g = tc.length;
		while(_g1 < _g) {
			var n = _g1++;
			var t = tc[n];
			if(t < 0) t += 1;
			if(t > 1) t -= 1;
			if(t < 0.16666666666666666) tc[n] = p + (q - p) * 6 * t; else if(t < 0.5) tc[n] = q; else if(t < 0.66666666666666663) tc[n] = p + (q - p) * 6 * (0.66666666666666663 - t); else tc[n] = p;
		}
		this.set_r(tc[0]);
		this.set_g(tc[1]);
		this.set_b(tc[2]);
		this.a = _color_hsl.a;
		return this;
	}
	,toString: function() {
		return "{ r:" + this.r + " , g:" + this.g + " , b:" + this.b + " , a:" + this.a + " }";
	}
	,from_int: function(_i) {
		var _r = _i >> 16;
		var _g = _i >> 8 & 255;
		var _b = _i & 255;
		this.set_r(_r / 255);
		this.set_g(_g / 255);
		this.set_b(_b / 255);
	}
	,__class__: phoenix_Color
	,__properties__: {set_b:"set_b",set_g:"set_g",set_r:"set_r"}
};
var luxe_debug_ProfilerDebugView = function() {
	this._setup = false;
	this._byte_levels = ["bytes","Kb","MB","GB","TB"];
	this.minpeak = 1.0;
	this.peak = 1.0;
	this.nexttick = 0.0;
	this.tickamount = 0.017;
	this.margin = 32;
	luxe_debug_DebugView.call(this);
	this.set_name("Profiler");
	luxe_debug_ProfilerDebugView.lists = new haxe_ds_StringMap();
};
$hxClasses["luxe.debug.ProfilerDebugView"] = luxe_debug_ProfilerDebugView;
luxe_debug_ProfilerDebugView.__name__ = ["luxe","debug","ProfilerDebugView"];
luxe_debug_ProfilerDebugView.add_offset = function(_id,_offset) {
	var _item = luxe_debug_ProfilerDebugView.lists.get(_id);
	var _offsetitem = luxe_debug_ProfilerDebugView.lists.get(_offset);
	if(_item != null && _offsetitem != null) _item.offsets.push(_offsetitem); else {
		haxe_Log.trace("not found for " + _id + " or " + _offset,{ fileName : "ProfilerDebugView.hx", lineNumber : 158, className : "luxe.debug.ProfilerDebugView", methodName : "add_offset"});
		haxe_Log.trace(Std.string(_item) + " / " + Std.string(_offsetitem),{ fileName : "ProfilerDebugView.hx", lineNumber : 159, className : "luxe.debug.ProfilerDebugView", methodName : "add_offset"});
	}
};
luxe_debug_ProfilerDebugView.hide_item = function(_id) {
	var _item = luxe_debug_ProfilerDebugView.lists.get(_id);
	if(_item != null) {
		_item.hidden = true;
		_item.bar.hide();
	}
};
luxe_debug_ProfilerDebugView.show_item = function(_id) {
	var _item = luxe_debug_ProfilerDebugView.lists.get(_id);
	if(_item != null) {
		_item.hidden = false;
		_item.bar.show();
	}
};
luxe_debug_ProfilerDebugView.start = function(_id,_max) {
	var _item = luxe_debug_ProfilerDebugView.lists.get(_id);
	if(_item == null) {
		_item = new luxe_debug__$ProfilerDebugView_ProfilerValue(_id,new luxe_debug__$ProfilerDebugView_ProfilerBar(_id,_max,new phoenix_Color().rgb(16121979)));
		_item.bar.set_pos(new phoenix_Vector(Luxe.debug.padding.x * 2,Luxe.debug.padding.y * 3 + Lambda.count(luxe_debug_ProfilerDebugView.lists) * 20));
		luxe_debug_ProfilerDebugView.lists.set(_id,_item);
	}
	_item.start = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
};
luxe_debug_ProfilerDebugView.end = function(_id) {
	var _item = luxe_debug_ProfilerDebugView.lists.get(_id);
	if(_item != null) _item.set(); else throw new js__$Boot_HaxeError("Debug / profile end called for " + _id + " but no start called");
};
luxe_debug_ProfilerDebugView.__super__ = luxe_debug_DebugView;
luxe_debug_ProfilerDebugView.prototype = $extend(luxe_debug_DebugView.prototype,{
	create: function() {
	}
	,update_graph: function(graph,val) {
		var _byte_index = Math.floor(Math.log(val) / Math.log(1024));
		var _byte_value = val / Math.pow(1024,_byte_index);
		if(_byte_value > this.peak) this.peak = Math.ceil(_byte_value + _byte_value * 0.1);
		if(_byte_value < this.minpeak) this.minpeak = Math.floor(_byte_value - _byte_value * 0.1);
		if(graph.max != this.peak) graph.set_max(this.peak);
		graph.set_ping(luxe_utils_Maths.fixed(_byte_value,4));
	}
	,process: function() {
	}
	,show: function() {
		var $it0 = luxe_debug_ProfilerDebugView.lists.iterator();
		while( $it0.hasNext() ) {
			var _item = $it0.next();
			if(!_item.hidden) _item.bar.show();
		}
		if(!this._setup) this._setup = true;
	}
	,hide: function() {
		var $it0 = luxe_debug_ProfilerDebugView.lists.iterator();
		while( $it0.hasNext() ) {
			var _item = $it0.next();
			_item.bar.hide();
		}
	}
	,__class__: luxe_debug_ProfilerDebugView
});
var luxe_debug__$ProfilerDebugView_ProfilerValue = function(_name,_bar) {
	this.accum = 0;
	this.count = 0;
	this.hidden = false;
	this.avg = 10;
	this.start = 0.0;
	this.name = _name;
	this.bar = _bar;
	this.history = [];
	this.offsets = [];
};
$hxClasses["luxe.debug._ProfilerDebugView.ProfilerValue"] = luxe_debug__$ProfilerDebugView_ProfilerValue;
luxe_debug__$ProfilerDebugView_ProfilerValue.__name__ = ["luxe","debug","_ProfilerDebugView","ProfilerValue"];
luxe_debug__$ProfilerDebugView_ProfilerValue.prototype = {
	set: function() {
		var _t = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start - this.start;
		var _g = 0;
		var _g1 = this.offsets;
		while(_g < _g1.length) {
			var _offset = _g1[_g];
			++_g;
			_t -= _offset.history[_offset.history.length - 1];
		}
		this.history.push(_t);
		if(this.history.length > this.avg) this.history.shift();
		this.count++;
		if(this.count == this.avg) {
			var __t = this.accum / this.avg;
			this.bar.set_value(__t);
			this.accum = 0;
			this.count = 0;
		}
		this.accum += _t;
		if(this.bar.visible) this.bar.set_text(Std.string(luxe_utils_Maths.fixed(_t * 1000,4)));
	}
	,__class__: luxe_debug__$ProfilerDebugView_ProfilerValue
};
var luxe_debug__$ProfilerDebugView_ProfilerGraph = function(_name,_bg) {
	if(_bg == null) _bg = true;
	this.visible = false;
	this.history = 33;
	this.height2 = 8;
	this.height = 8;
	this.width = 128;
	this.bg = true;
	this.bg = _bg;
	this.name = _name;
	this.color = new phoenix_Color();
	this.set_max(luxe_utils_Maths.fixed(16.666666666666668,2));
};
$hxClasses["luxe.debug._ProfilerDebugView.ProfilerGraph"] = luxe_debug__$ProfilerDebugView_ProfilerGraph;
luxe_debug__$ProfilerDebugView_ProfilerGraph.__name__ = ["luxe","debug","_ProfilerDebugView","ProfilerGraph"];
luxe_debug__$ProfilerDebugView_ProfilerGraph.prototype = {
	create: function() {
		this.segment = this.width / this.history;
		this.height2 = this.height * 2;
		if(this.bg) this.graphbg_geometry = Luxe.draw.box({ color : new phoenix_Color().rgb(1052688), depth : 999.3, batcher : Luxe.debug.batcher, x : 0, y : 0, w : this.width - this.segment, h : this.height2});
		this.graph_geometry = new phoenix_geometry_Geometry({ color : this.color, depth : 999.33, batcher : Luxe.debug.batcher});
		var _g1 = 0;
		var _g = this.history;
		while(_g1 < _g) {
			var i = _g1++;
			var _b = new phoenix_geometry_Vertex(new phoenix_Vector(this.segment * i,this.height2),this.color);
			this.graph_geometry.add(_b);
		}
		this.graph_geometry.set_primitive_type(3);
		this.hide();
	}
	,set_max: function(_v) {
		var oldmax = this.max;
		this.max = _v;
		if(this.graph_geometry != null) {
			var ratio = 1.0;
			if(oldmax != 0) ratio = oldmax / _v;
			var _g = 0;
			var _g1 = this.graph_geometry.vertices;
			while(_g < _g1.length) {
				var v = _g1[_g];
				++_g;
				if(v != null) {
					var vp = 1.0 - v.pos.y / this.height2;
					var vv = vp * oldmax;
					vp = vv / this.max;
					v.pos.set_y(this.height2 * (1.0 - vp));
				}
			}
		}
		return this.max;
	}
	,set_ping: function(_v) {
		var _vv = luxe_utils_Maths.fixed(_v,4);
		var _p = _vv / this.max;
		var _g1 = 0;
		var _g = this.history;
		while(_g1 < _g) {
			var i = _g1++;
			var v = this.graph_geometry.vertices[i];
			if(i < this.history - 1) {
				var v1 = this.graph_geometry.vertices[i + 1];
				if(v1 != null) {
					v.pos.set_y(Math.floor(v1.pos.y));
					v.color = v1.color;
				}
			}
		}
		if(_p < 0.001) _p = 0.001; else if(_p > 1) _p = 1; else _p = _p;
		if(_p > 1) this.graph_geometry.vertices[this.history - 1].color = luxe_debug_ProfilerDebugView.color_red; else if(_p < 0.2) this.graph_geometry.vertices[this.history - 1].color = luxe_debug_ProfilerDebugView.color_green; else this.graph_geometry.vertices[this.history - 1].color = this.color;
		this.graph_geometry.vertices[this.history - 1].pos.set_y(Math.floor(this.height2 * (1.0 - _p)));
		return this.ping = _v;
	}
	,hide: function() {
		this.visible = false;
		this.graph_geometry.set_visible(false);
		if(this.graphbg_geometry != null) this.graphbg_geometry.set_visible(false);
	}
	,show: function() {
		this.visible = true;
		this.graph_geometry.set_visible(true);
		if(this.graphbg_geometry != null) this.graphbg_geometry.set_visible(true);
	}
	,set_pos: function(_p) {
		if(this.graphbg_geometry != null) this.graphbg_geometry.transform.local.pos.copy_from(_p);
		this.graph_geometry.transform.local.pos.copy_from(_p);
		return this.pos = _p;
	}
	,__class__: luxe_debug__$ProfilerDebugView_ProfilerGraph
	,__properties__: {set_pos:"set_pos",set_ping:"set_ping",set_max:"set_max"}
};
var luxe_debug__$ProfilerDebugView_ProfilerBar = function(_name,_max,_color) {
	this.max = 16.7;
	this.height = 8;
	this.visible = false;
	this.name = _name;
	this.graph = new luxe_debug__$ProfilerDebugView_ProfilerGraph(_name);
	this.graph.create();
	if(_max != null) this.graph.set_max(_max);
	this.text_item = new luxe_Text({ no_scene : true, name : "profiler.text." + _name, pos : new phoenix_Vector(0,0), color : _color, point_size : this.height * 1.8, depth : 999.3, text : "", batcher : Luxe.debug.batcher});
	this.bg_geometry = Luxe.draw.box({ color : new phoenix_Color().rgb(592137), depth : 999.3, batcher : Luxe.debug.batcher, x : 0, y : 0, w : this.graph.width, h : this.graph.height});
	this.bar_geometry = Luxe.draw.box({ color : _color, depth : 999.33, batcher : Luxe.debug.batcher, x : 1, y : 1, w : this.graph.width - 2, h : this.graph.height - 2});
	this.hide();
};
$hxClasses["luxe.debug._ProfilerDebugView.ProfilerBar"] = luxe_debug__$ProfilerDebugView_ProfilerBar;
luxe_debug__$ProfilerDebugView_ProfilerBar.__name__ = ["luxe","debug","_ProfilerDebugView","ProfilerBar"];
luxe_debug__$ProfilerDebugView_ProfilerBar.prototype = {
	hide: function() {
		this.visible = false;
		this.bar_geometry.set_visible(false);
		this.bg_geometry.set_visible(false);
		this.text_item.set_visible(false);
		this.graph.hide();
	}
	,show: function() {
		this.visible = true;
		this.bar_geometry.set_visible(true);
		this.bg_geometry.set_visible(true);
		this.text_item.set_visible(true);
		this.graph.show();
	}
	,set_value: function(_v) {
		this.graph.set_ping(_v * 1000);
		if(!this.visible) return this.value = _v;
		var _vv = luxe_utils_Maths.fixed(_v * 1000,4);
		var _p = _vv / this.max;
		if(_p < 0.005) _p = 0.005; else if(_p > 1) _p = 1; else _p = _p;
		if(_p > 1) this.bar_geometry.set_color(luxe_debug_ProfilerDebugView.color_red); else if(_p < 0.15) this.bar_geometry.set_color(luxe_debug_ProfilerDebugView.color_green); else this.bar_geometry.set_color(luxe_debug_ProfilerDebugView.color_normal);
		var nx = (this.graph.width - 2) * _p;
		this.bar_geometry.resize_xy(nx,this.graph.height - 2);
		return this.value = _v;
	}
	,set_pos: function(_p) {
		this.bg_geometry.transform.local.set_pos(_p);
		this.bar_geometry.transform.local.pos.set_xy(_p.x + 1,_p.y + 1);
		this.text_item.get_pos().set_xy(_p.x + this.graph.width * 2 + 10,_p.y - 6);
		this.graph.set_pos(new phoenix_Vector(_p.x,_p.y,_p.z,_p.w).add_xyz(this.graph.width + 2,-this.graph.height + 4,null));
		return this.pos = _p;
	}
	,set_text: function(_t) {
		this.text_item.set_text("" + this.name + " (" + this.graph.max + "ms) | " + _t + "ms");
		return this.text = _t;
	}
	,__class__: luxe_debug__$ProfilerDebugView_ProfilerBar
	,__properties__: {set_value:"set_value",set_pos:"set_pos",set_text:"set_text"}
};
var luxe_debug_SceneDebugView = function() {
	this.hide_ids = true;
	this.font_size = 15.0;
	this.margin = 32;
	luxe_debug_DebugView.call(this);
	this.set_name("Scenes");
	this.scenes = [];
};
$hxClasses["luxe.debug.SceneDebugView"] = luxe_debug_SceneDebugView;
luxe_debug_SceneDebugView.__name__ = ["luxe","debug","SceneDebugView"];
luxe_debug_SceneDebugView.__super__ = luxe_debug_DebugView;
luxe_debug_SceneDebugView.prototype = $extend(luxe_debug_DebugView.prototype,{
	create: function() {
		var debug = Luxe.debug;
		this.items_list = new luxe_Text({ name : "debug.scene.list", depth : 999.3, no_scene : true, color : new phoenix_Color(0,0,0,1).rgb(16121979), pos : new phoenix_Vector(0,0), font : Luxe.renderer.font, text : this.get_list(), point_size : this.font_size, batcher : debug.batcher, visible : false});
		this.items_list.geometry.id = "debug.scene.list.geometry";
		this.resize();
	}
	,add_scene: function(_scene) {
		if(!(HxOverrides.indexOf(this.scenes,_scene,0) == -1)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("scenes.indexOf(_scene) == -1" + ""));
		this.scenes.push(_scene);
	}
	,remove_scene: function(_scene) {
		if(!(HxOverrides.indexOf(this.scenes,_scene,0) != -1)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("scenes.indexOf(_scene) != -1" + ""));
		var _result = HxOverrides.remove(this.scenes,_scene);
		this.refresh();
		return _result;
	}
	,onkeydown: function(e) {
		if(e.keycode == 50 && this.visible) this.toggle_ids();
	}
	,toggle_ids: function() {
		this.hide_ids = !this.hide_ids;
		this.refresh();
	}
	,tabs: function(_d) {
		var res = "";
		var _g = 0;
		while(_g < _d) {
			var i = _g++;
			res += "    ";
		}
		return res;
	}
	,list_entity: function(_list,e,_depth) {
		if(_depth == null) _depth = 1;
		var _active;
		if(e.get_active()) _active = ""; else _active = "/ inactive";
		var _pre;
		if(_depth == 1) _pre = this.tabs(_depth); else _pre = this.tabs(_depth) + "> ";
		var _id;
		if(this.hide_ids) _id = ""; else _id = e.get_id();
		var _comp_count = Lambda.count(e._components.components);
		var _comp = "• " + _comp_count;
		var _childs = "> " + e.children.length;
		_list += "" + _pre + _id + " " + e.get_name() + " " + _childs + " " + _comp + " " + _active + "\n";
		var $it0 = HxOverrides.iter(e._components.components._keys);
		while( $it0.hasNext() ) {
			var _name = $it0.next();
			var comp = e._components.components.map.get(_name);
			var _comp_id;
			if(this.hide_ids) _comp_id = ""; else _comp_id = " " + comp.id;
			_list += this.tabs(_depth + 1) + ("•" + _comp_id + " " + comp.name + "\n");
		}
		var _g = 0;
		var _g1 = e.children;
		while(_g < _g1.length) {
			var _child = _g1[_g];
			++_g;
			_list = this.list_entity(_list,_child,_depth + 2);
		}
		return _list;
	}
	,get_list: function() {
		var _result = "";
		var _g = 0;
		var _g1 = this.scenes;
		while(_g < _g1.length) {
			var _scene = _g1[_g];
			++_g;
			var _id;
			if(this.hide_ids) _id = ""; else _id = "" + _scene.get_id() + " ";
			_result += _id;
			_result += "" + _scene.get_name() + " ";
			_result += "( " + _scene.get_length() + " )\n";
			var $it0 = _scene.entities.iterator();
			while( $it0.hasNext() ) {
				var _entity = $it0.next();
				_result = this.list_entity(_result,_entity,null);
			}
		}
		return _result;
	}
	,refresh: function() {
		this.items_list.set_text(this.get_list());
	}
	,process: function() {
		if(!this.visible) return;
		var _has_changed = false;
		var _g = 0;
		var _g1 = this.scenes;
		while(_g < _g1.length) {
			var _scene = _g1[_g];
			++_g;
			if(_scene._has_changed) {
				_has_changed = true;
				_scene._has_changed = false;
			}
		}
		if(_has_changed) this.refresh();
	}
	,onmousewheel: function(e) {
		var h = this.items_list.text_bounds.h;
		var vh = Luxe.debug.inspector.size.y - this.margin;
		var diff = h - vh;
		var new_y = this.items_list.get_pos().y;
		var max_y = Luxe.debug.padding.y + this.margin * 1.5;
		var min_y = max_y;
		if(diff > 0) min_y = max_y - (diff + this.margin * 2);
		new_y -= this.margin / 2 * e.y;
		if(new_y < min_y) new_y = min_y; else if(new_y > max_y) new_y = max_y; else new_y = new_y;
		this.items_list.get_pos().set_y(new_y);
	}
	,show: function() {
		luxe_debug_DebugView.prototype.show.call(this);
		this.refresh();
		this.items_list.set_visible(true);
	}
	,hide: function() {
		luxe_debug_DebugView.prototype.hide.call(this);
		this.items_list.set_visible(false);
	}
	,resize: function() {
		var debug = Luxe.debug;
		var viewrect = new phoenix_Rectangle(debug.inspector.pos.x + this.margin / 2,debug.inspector.pos.y + this.margin * 1.5,debug.inspector.size.x - this.margin,debug.inspector.size.y - this.margin - this.margin * 1.5);
		var left = debug.padding.x + this.margin;
		var top = debug.padding.y + this.margin * 1.5;
		if(this.items_list != null) {
			this.items_list.set_pos(new phoenix_Vector(left,top));
			this.items_list.set_clip_rect(viewrect);
		}
	}
	,onwindowsized: function(e) {
		this.resize();
	}
	,__class__: luxe_debug_SceneDebugView
});
var luxe_debug_StatsDebugView = function() {
	this.hide_debug = true;
	this.margin = 32;
	this.font_size = 15;
	this.debug_geometry_count = 13;
	this.debug_draw_call_count = 3;
	luxe_debug_DebugView.call(this);
	this.set_name("Statistics");
	this._last_render_stats = { batchers : 0, geometry_count : 0, dynamic_batched_count : 0, static_batched_count : 0, visible_count : 0, draw_calls : 0, vert_count : 0};
	this._render_stats = { batchers : 0, geometry_count : 0, dynamic_batched_count : 0, static_batched_count : 0, visible_count : 0, draw_calls : 0, vert_count : 0};
};
$hxClasses["luxe.debug.StatsDebugView"] = luxe_debug_StatsDebugView;
luxe_debug_StatsDebugView.__name__ = ["luxe","debug","StatsDebugView"];
luxe_debug_StatsDebugView.__super__ = luxe_debug_DebugView;
luxe_debug_StatsDebugView.prototype = $extend(luxe_debug_DebugView.prototype,{
	get_resource_stats_string: function() {
		return Std.string(Luxe.resources.stats);
	}
	,get_batcher_info: function(b) {
		var _s;
		_s = "  " + b.name + " (enabled " + (b.enabled == null?"null":"" + b.enabled) + ", layer " + b.layer + ")\n";
		_s += "    max verts/batch: " + b.max_verts + "\n";
		_s += "    verts: " + b.vert_count + "\n";
		_s += "    visible geom: " + b.visible_count + "\n";
		_s += "    draw calls: " + b.draw_calls + "\n";
		_s += "    batched: " + b.dynamic_batched_count + "\n";
		_s += "    static: " + b.static_batched_count + "\n";
		_s += "    shader: " + (b.shader == null?"none":b.shader.id) + "\n";
		return _s;
	}
	,get_render_stats_string: function() {
		var _bs = "";
		if(!this.hide_debug) _bs += this.get_batcher_info(Luxe.debug.batcher);
		var _g = 0;
		var _g1 = Luxe.renderer.batchers;
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			_bs += this.get_batcher_info(b);
		}
		return "Renderer Statistics\n\n" + "total geometry : " + this._render_stats.geometry_count + "\n" + "visible geometry : " + this._render_stats.visible_count + "\n" + "dynamic batch count : " + this._render_stats.dynamic_batched_count + "\n" + "static batch count : " + this._render_stats.static_batched_count + "\n" + "total draw calls : " + this._render_stats.draw_calls + "\n" + "total vert count : " + this._render_stats.vert_count + "\n" + "batchers : " + this._render_stats.batchers + "\n" + _bs;
	}
	,create: function() {
		var _g = this;
		var debug = Luxe.debug;
		this.render_stats_text = new luxe_Text({ name : "debug.render.stats", depth : 999.3, no_scene : true, color : new phoenix_Color(0,0,0,1).rgb(16121979), pos : new phoenix_Vector(0,0), font : Luxe.renderer.font, text : this.get_render_stats_string(), point_size : this.font_size, batcher : debug.batcher, visible : false});
		this.resource_list_text = new luxe_Text({ name : "debug.resource.stats", depth : 999.3, no_scene : true, color : new phoenix_Color(0,0,0,1).rgb(16121979), pos : new phoenix_Vector(0,0), font : Luxe.renderer.font, text : "", align : 1, point_size : this.font_size * 0.9, batcher : debug.batcher, visible : false});
		this.render_stats_text.geometry.id = "debug.render.stats.geometry";
		this.render_stats_text.geometry.id = "debug.resource.stats.geometry";
		this.resize();
		Luxe.resources.on(1,function(_) {
			if(_g.visible) _g.refresh();
		});
	}
	,resize: function() {
		if(this.resource_list_text == null || this.render_stats_text == null) return;
		var debug = Luxe.debug;
		var viewrect = new phoenix_Rectangle(debug.inspector.pos.x + this.margin / 2,debug.inspector.pos.y + this.margin * 1.5,debug.inspector.size.x - this.margin,debug.inspector.size.y - this.margin - this.margin * 1.5);
		var left = debug.padding.x + this.margin;
		var right = debug.padding.x + debug.inspector.size.x - this.margin;
		var top = debug.padding.y + this.margin * 1.5;
		var render_w = this.render_stats_text.text_bounds.w;
		var render_h = this.render_stats_text.text_bounds.h;
		if(this.resource_list_text != null) {
			this.resource_list_text.set_pos(new phoenix_Vector(right,top));
			this.resource_list_text.set_clip_rect(viewrect);
		}
		if(this.render_stats_text != null) {
			this.render_stats_text.set_pos(new phoenix_Vector(left,top));
			this.render_stats_text.set_clip_rect(viewrect);
		}
		this.reset_tween();
	}
	,onwindowsized: function(e) {
		this.resize();
	}
	,refresh: function() {
		var bytes_lists = "";
		var text_lists = "";
		var json_lists = "";
		var texture_lists = "";
		var rtt_lists = "";
		var font_lists = "";
		var shader_lists = "";
		var audio_lists = "";
		var _total_txt = 0;
		var _total_tex = 0;
		var _total_rtt = 0;
		var _total_snd = 0;
		var _total_all = 0;
		var _snd = function(res) {
			var _s = "";
			if(res.source != null) {
				if(res.source.data.is_stream) _s += "STREAM •"; else _s += "";
				_s += " " + res.id + " • " + res.ref + "\t\n";
				if(res.source.data != null && !res.source.data.is_stream) {
					_s += "~" + Luxe.utils.bytes_to_string(res.source.data.length);
					_total_snd += res.source.data.length;
				}
				if(res.source.data != null) {
					_s += " " + res.source.data.channels + "ch";
					_s += " " + luxe_utils_Maths.fixed(res.source.data.rate / 1000,1) + "khz";
					_s += " " + (function($this) {
						var $r;
						var this1 = res.source.data.format;
						$r = this1 != null?(function($this) {
							var $r;
							switch(this1) {
							case 0:
								$r = "af_unknown";
								break;
							case 1:
								$r = "af_custom";
								break;
							case 2:
								$r = "af_ogg";
								break;
							case 3:
								$r = "af_wav";
								break;
							case 4:
								$r = "af_pcm";
								break;
							default:
								$r = "" + this1;
							}
							return $r;
						}($this)):"" + this1;
						return $r;
					}(this));
					_s += " " + luxe_utils_Maths.fixed(res.source.duration(),4) + "s";
				}
				_s += "\t\t\n\n";
			} else _s += "" + res.id + " • " + res.ref + "\t\n";
			return _s;
		};
		var $it0 = Luxe.resources.cache.iterator();
		while( $it0.hasNext() ) {
			var res1 = $it0.next();
			var _g = res1.resource_type;
			switch(_g) {
			case 3:
				bytes_lists += "" + res1.id + " • " + res1.ref + "\t\n";
				break;
			case 1:
				var res2 = res1;
				var _l;
				if(res2.asset != null && res2.asset.text != null) _l = res2.asset.text.length; else _l = 0;
				_total_txt += _l;
				text_lists += "(~" + Luxe.utils.bytes_to_string(_l) + ") " + res2.id + " • " + res2.ref + "\t\n";
				break;
			case 2:
				json_lists += "" + res1.id + " • " + res1.ref + "\t\n";
				break;
			case 4:
				var tex = res1;
				if(tex.resource_type == 5) _total_rtt += tex.memory_use(); else _total_tex += tex.memory_use();
				texture_lists += "(" + tex.width_actual + "x" + tex.height_actual + " ~" + Luxe.utils.bytes_to_string(tex.memory_use()) + ")    " + tex.id + " • " + tex.ref + "\t\n";
				break;
			case 5:
				var tex1 = res1;
				if(tex1.resource_type == 5) _total_rtt += tex1.memory_use(); else _total_tex += tex1.memory_use();
				rtt_lists += "(" + tex1.width_actual + "x" + tex1.height_actual + " ~" + Luxe.utils.bytes_to_string(tex1.memory_use()) + ")    " + tex1.id + " • " + tex1.ref + "\t\n";
				break;
			case 6:
				font_lists += "" + res1.id + " • " + res1.ref + "\t\n";
				break;
			case 7:
				var res3 = res1;
				shader_lists += "(" + res3.vert_id + ", " + res3.frag_id + ")    " + res3.id + " • " + res3.ref + "\t\n";
				break;
			case 8:
				audio_lists += _snd(res1);
				break;
			default:
			}
		}
		_total_all += _total_txt;
		_total_all += _total_tex;
		_total_all += _total_rtt;
		_total_all += _total_snd;
		var lists = "Resource list (" + Luxe.resources.stats.total + " • ~" + Luxe.utils.bytes_to_string(_total_all) + ")\n\n";
		lists += "Bytes (" + Luxe.resources.stats.bytes + ")\n";
		if(bytes_lists == "") lists += "-\t\n"; else lists += bytes_lists;
		lists += "\nText (" + Luxe.resources.stats.texts + " • ~" + Luxe.utils.bytes_to_string(_total_txt) + ")\n";
		if(text_lists == "") lists += "-\t\n"; else lists += text_lists;
		lists += "\nJSON (" + Luxe.resources.stats.jsons + ")\n";
		if(json_lists == "") lists += "-\t\n"; else lists += json_lists;
		lists += "\nTexture (" + Luxe.resources.stats.textures + " • ~" + Luxe.utils.bytes_to_string(_total_tex) + ")\n";
		if(texture_lists == "") lists += "-\t\n"; else lists += texture_lists;
		lists += "\nRenderTexture (" + Luxe.resources.stats.rtt + " • ~" + Luxe.utils.bytes_to_string(_total_rtt) + ")\n";
		if(rtt_lists == "") lists += "-\t\n"; else lists += rtt_lists;
		lists += "\nFont (" + Luxe.resources.stats.fonts + ")\n";
		if(font_lists == "") lists += "-\t\n"; else lists += font_lists;
		lists += "\nShader (" + Luxe.resources.stats.shaders + ")\n";
		if(shader_lists == "") lists += "-\t\n"; else lists += shader_lists;
		lists += "\nAudio (" + Luxe.resources.stats.audios + " • ~" + Luxe.utils.bytes_to_string(_total_snd) + ")\n";
		if(audio_lists == "") lists += "-\t\n"; else lists += audio_lists;
		this.resource_list_text.set_text(lists);
		if(this.resource_list_text.geometry != null) this.resource_list_text.geometry.set_dirty(true);
		this.reset_tween();
	}
	,process: function() {
		if(!this.visible) return;
		var dirty = false;
		this.update_render_stats();
		if(this._last_render_stats.batchers != this._render_stats.batchers) {
			dirty = true;
			this._last_render_stats.batchers = this._render_stats.batchers;
		}
		if(this._last_render_stats.geometry_count != this._render_stats.geometry_count) {
			dirty = true;
			this._last_render_stats.geometry_count = this._render_stats.geometry_count;
		}
		if(this._last_render_stats.dynamic_batched_count != this._render_stats.dynamic_batched_count) {
			dirty = true;
			this._last_render_stats.dynamic_batched_count = this._render_stats.dynamic_batched_count;
		}
		if(this._last_render_stats.static_batched_count != this._render_stats.static_batched_count) {
			dirty = true;
			this._last_render_stats.static_batched_count = this._render_stats.static_batched_count;
		}
		if(this._last_render_stats.visible_count != this._render_stats.visible_count) {
			dirty = true;
			this._last_render_stats.visible_count = this._render_stats.visible_count;
		}
		if(this._last_render_stats.draw_calls != this._render_stats.draw_calls) {
			dirty = true;
			this._last_render_stats.draw_calls = this._render_stats.draw_calls;
		}
		if(this._last_render_stats.vert_count != this._render_stats.vert_count) {
			dirty = true;
			this._last_render_stats.vert_count = this._render_stats.vert_count;
		}
		if(dirty) this.refresh_render_stats();
	}
	,onmousewheel: function(e) {
		luxe_tween_Actuate.stop(this.resource_list_text.get_pos());
		luxe_tween_Actuate.stop(this.render_stats_text.get_pos());
		var vh = Luxe.debug.inspector.size.y - this.margin;
		var max_y = Luxe.debug.padding.y + this.margin * 1.5;
		var min_y = max_y;
		var px = e.pos.x / Luxe.core.screen.get_w();
		if(px > 0.5) {
			var h = this.resource_list_text.text_bounds.h;
			var diff = h - vh;
			var new_y = this.resource_list_text.get_pos().y;
			if(diff > 0) min_y = max_y - (diff + this.margin * 2);
			new_y -= this.margin / 2 * e.y;
			if(new_y < min_y) new_y = min_y; else if(new_y > max_y) new_y = max_y; else new_y = new_y;
			this.resource_list_text.get_pos().set_y(new_y);
			this.resource_list_text.geometry.set_dirty(true);
		} else {
			var h1 = this.render_stats_text.text_bounds.h;
			var diff1 = h1 - vh;
			var new_y1 = this.render_stats_text.get_pos().y;
			if(diff1 > 0) min_y = max_y - (diff1 + this.margin * 2);
			new_y1 -= this.margin / 2 * e.y;
			if(new_y1 < min_y) new_y1 = min_y; else if(new_y1 > max_y) new_y1 = max_y; else new_y1 = new_y1;
			this.render_stats_text.get_pos().set_y(new_y1);
			this.render_stats_text.geometry.set_dirty(true);
		}
	}
	,onkeydown: function(e) {
		if(e.keycode == 50 && this.visible) this.toggle_debug_stats();
	}
	,show: function() {
		luxe_debug_DebugView.prototype.show.call(this);
		this.refresh();
		this.render_stats_text.set_visible(true);
		this.resource_list_text.set_visible(true);
	}
	,hide: function() {
		luxe_debug_DebugView.prototype.hide.call(this);
		this.render_stats_text.set_visible(false);
		this.resource_list_text.set_visible(false);
		luxe_tween_Actuate.stop(this.resource_list_text.get_pos());
		luxe_tween_Actuate.stop(this.render_stats_text.get_pos());
	}
	,reset_tween: function() {
		var _g = this;
		luxe_tween_Actuate.stop(this.resource_list_text.get_pos());
		luxe_tween_Actuate.stop(this.render_stats_text.get_pos());
		var vh = Luxe.debug.inspector.size.y - this.margin;
		var start_y = Luxe.debug.padding.y + this.margin * 1.5;
		var h = this.resource_list_text.text_bounds.h;
		var diff = h - vh;
		this.resource_list_text.get_pos().set_y(start_y);
		if(diff > 0) {
			var end_y = start_y - (diff + this.margin * 2);
			luxe_tween_Actuate.tween(this.resource_list_text.get_pos(),8,{ y : end_y}).repeat().delay(4).reflect().ease(luxe_tween_easing_Linear.get_easeNone()).onUpdate(function() {
				_g.resource_list_text.geometry.set_dirty(true);
			});
		}
		h = this.render_stats_text.text_bounds.h;
		diff = h - vh;
		this.render_stats_text.get_pos().set_y(start_y);
		if(diff > 0) {
			var end_y1 = start_y - (diff + this.margin * 2);
			luxe_tween_Actuate.tween(this.render_stats_text.get_pos(),8,{ y : end_y1}).repeat().delay(4).reflect().ease(luxe_tween_easing_Linear.get_easeNone()).onUpdate(function() {
				_g.render_stats_text.geometry.set_dirty(true);
			});
		}
	}
	,refresh_render_stats: function() {
		if(!this.visible) return;
		this.render_stats_text.set_text(this.get_render_stats_string());
		this.render_stats_text.set_locked(true);
		if(this.render_stats_text.geometry != null) this.render_stats_text.geometry.set_dirty(true);
	}
	,toggle_debug_stats: function() {
		this.hide_debug = !this.hide_debug;
	}
	,update_render_stats: function() {
		this.debug_geometry_count = Luxe.debug.batcher.geometry.size();
		this.debug_draw_call_count = Luxe.debug.batcher.draw_calls;
		this._render_stats.batchers = Luxe.renderer.stats.batchers + 1;
		this._render_stats.geometry_count = Luxe.renderer.stats.geometry_count;
		this._render_stats.visible_count = Luxe.renderer.stats.visible_count;
		this._render_stats.dynamic_batched_count = Luxe.renderer.stats.dynamic_batched_count;
		this._render_stats.static_batched_count = Luxe.renderer.stats.static_batched_count;
		this._render_stats.draw_calls = Luxe.renderer.stats.draw_calls;
		this._render_stats.vert_count = Luxe.renderer.stats.vert_count;
		if(this.hide_debug) {
			this._render_stats.batchers -= 1;
			this._render_stats.geometry_count = this._render_stats.geometry_count - this.debug_geometry_count;
			this._render_stats.visible_count = this._render_stats.visible_count - Luxe.debug.batcher.visible_count;
			this._render_stats.dynamic_batched_count = this._render_stats.dynamic_batched_count - Luxe.debug.batcher.dynamic_batched_count;
			this._render_stats.static_batched_count = this._render_stats.static_batched_count - Luxe.debug.batcher.static_batched_count;
			this._render_stats.draw_calls -= this.debug_draw_call_count;
			this._render_stats.vert_count -= Luxe.debug.batcher.vert_count;
		}
	}
	,__class__: luxe_debug_StatsDebugView
});
var luxe_debug_TraceDebugView = function() {
	this._last_logged_length = 0;
	this.max_lines = 35;
	luxe_debug_DebugView.call(this);
	this.set_name("Log");
	Luxe.debug.add_trace_listener("TraceDebugView",$bind(this,this.on_trace));
	this.logged = [];
	this.add_line("luxe version " + Luxe.core.build);
};
$hxClasses["luxe.debug.TraceDebugView"] = luxe_debug_TraceDebugView;
luxe_debug_TraceDebugView.__name__ = ["luxe","debug","TraceDebugView"];
luxe_debug_TraceDebugView.__super__ = luxe_debug_DebugView;
luxe_debug_TraceDebugView.prototype = $extend(luxe_debug_DebugView.prototype,{
	on_trace: function(v,inf) {
		this.add_line(inf.fileName + ":" + inf.lineNumber + " " + Std.string(v));
	}
	,create: function() {
		var debug = Luxe.debug;
		var text_bounds = new phoenix_Rectangle(debug.padding.x + 20,debug.padding.y + 40,Luxe.core.screen.get_w() - debug.padding.x * 2 - 20,Luxe.core.screen.get_h() - debug.padding.y * 2 - 40);
		this.lines = new luxe_Text({ name : "debug.log.text", no_scene : true, depth : 999.3, color : new phoenix_Color().rgb(8947848), bounds : text_bounds, bounds_wrap : true, font : Luxe.renderer.font, text : "", align_vertical : 4, point_size : 12, batcher : debug.batcher, visible : false});
		if(this.lines.geometry != null) {
			this.lines.geometry.set_clip_rect(text_bounds);
			this.lines.geometry.set_locked(true);
			this.lines.geometry.id = "debug.log.text.geometry";
		}
	}
	,onwindowsized: function(e) {
		var debug = Luxe.debug;
		var text_bounds = new phoenix_Rectangle(debug.padding.x + 20,debug.padding.y + 40,Luxe.core.screen.get_w() - debug.padding.x * 2 - 20,Luxe.core.screen.get_h() - debug.padding.y * 2 - 40);
		this.lines.set_bounds(text_bounds);
		this.lines.set_clip_rect(text_bounds);
		if(this.lines.geometry != null) {
			this.lines.geometry.set_locked(true);
			this.lines.geometry.set_dirty(true);
		}
	}
	,add_line: function(_t) {
		if(this.logged == null) return;
		this.logged.push(_t);
		if(!this.visible) return;
		this.refresh_lines();
	}
	,refresh_lines: function() {
		if(this._last_logged_length == this.logged.length) return;
		var _final = "";
		if(this.logged.length <= this.max_lines) {
			var _g = 0;
			var _g1 = this.logged;
			while(_g < _g1.length) {
				var _line = _g1[_g];
				++_g;
				_final += _line + "\n";
			}
		} else {
			var _start = this.logged.length - this.max_lines;
			var _total = this.logged.length;
			var _g11 = _start;
			var _g2 = this.logged.length;
			while(_g11 < _g2) {
				var i = _g11++;
				var _line1 = this.logged[i];
				_final += _line1 + "\n";
			}
		}
		this.lines.set_text(_final);
		if(this.lines.geometry != null) {
			this.lines.geometry.set_locked(true);
			this.lines.geometry.set_dirty(true);
		}
		this._last_logged_length = this.logged.length;
	}
	,refresh: function() {
	}
	,process: function() {
	}
	,show: function() {
		luxe_debug_DebugView.prototype.show.call(this);
		this.refresh_lines();
		this.lines.set_visible(true);
	}
	,hide: function() {
		luxe_debug_DebugView.prototype.hide.call(this);
		this.lines.set_visible(false);
	}
	,__class__: luxe_debug_TraceDebugView
});
var luxe_importers_bitmapfont_BitmapFontParser = function() { };
$hxClasses["luxe.importers.bitmapfont.BitmapFontParser"] = luxe_importers_bitmapfont_BitmapFontParser;
luxe_importers_bitmapfont_BitmapFontParser.__name__ = ["luxe","importers","bitmapfont","BitmapFontParser"];
luxe_importers_bitmapfont_BitmapFontParser.parse = function(_font_data) {
	if(_font_data.length == 0) throw new js__$Boot_HaxeError("BitmapFont:Parser: _font_data is 0 length");
	var _info = { face : null, chars : new haxe_ds_IntMap(), point_size : 0, base_size : 0, char_count : 0, line_height : 0, pages : [], kernings : new haxe_ds_IntMap()};
	var _lines = _font_data.split("\n");
	if(_lines.length == 0) throw new js__$Boot_HaxeError("BitmapFont; invalid font data specified for parser.");
	var _first = _lines[0];
	if((function($this) {
		var $r;
		var _this = StringTools.ltrim(_first);
		$r = HxOverrides.substr(_this,0,4);
		return $r;
	}(this)) != "info") throw new js__$Boot_HaxeError("BitmapFont; invalid font data specified for parser. Format should be plain ascii text .fnt file only currently.");
	var _g = 0;
	while(_g < _lines.length) {
		var _line = _lines[_g];
		++_g;
		var _tokens = _line.split(" ");
		var _g1 = 0;
		while(_g1 < _tokens.length) {
			var _current = _tokens[_g1];
			++_g1;
			luxe_importers_bitmapfont_BitmapFontParser.parse_token(_current,_tokens,_info);
		}
		_tokens = null;
	}
	_lines = null;
	return _info;
};
luxe_importers_bitmapfont_BitmapFontParser.parse_token = function(_token,_tokens,_info) {
	_tokens.shift();
	var _items = luxe_importers_bitmapfont_BitmapFontParser.tokenize_line(_tokens);
	switch(_token) {
	case "info":
		_info.face = luxe_importers_bitmapfont_BitmapFontParser.unquote(__map_reserved.face != null?_items.getReserved("face"):_items.h["face"]);
		_info.point_size = Std.parseFloat(__map_reserved.size != null?_items.getReserved("size"):_items.h["size"]);
		break;
	case "common":
		_info.line_height = Std.parseFloat(__map_reserved.lineHeight != null?_items.getReserved("lineHeight"):_items.h["lineHeight"]);
		_info.base_size = Std.parseFloat(__map_reserved.base != null?_items.getReserved("base"):_items.h["base"]);
		break;
	case "page":
		_info.pages.push({ id : Std.parseInt(__map_reserved.id != null?_items.getReserved("id"):_items.h["id"]), file : luxe_importers_bitmapfont_BitmapFontParser.trim(luxe_importers_bitmapfont_BitmapFontParser.unquote(__map_reserved.file != null?_items.getReserved("file"):_items.h["file"]))});
		break;
	case "chars":
		_info.char_count = Std.parseInt(__map_reserved.count != null?_items.getReserved("count"):_items.h["count"]);
		break;
	case "char":
		var _char = { id : Std.parseInt(__map_reserved.id != null?_items.getReserved("id"):_items.h["id"]), x : Std.parseFloat(__map_reserved.x != null?_items.getReserved("x"):_items.h["x"]), y : Std.parseFloat(__map_reserved.y != null?_items.getReserved("y"):_items.h["y"]), width : Std.parseFloat(__map_reserved.width != null?_items.getReserved("width"):_items.h["width"]), height : Std.parseFloat(__map_reserved.height != null?_items.getReserved("height"):_items.h["height"]), xoffset : Std.parseFloat(__map_reserved.xoffset != null?_items.getReserved("xoffset"):_items.h["xoffset"]), yoffset : Std.parseFloat(__map_reserved.yoffset != null?_items.getReserved("yoffset"):_items.h["yoffset"]), xadvance : Std.parseFloat(__map_reserved.xadvance != null?_items.getReserved("xadvance"):_items.h["xadvance"]), page : Std.parseInt(__map_reserved.page != null?_items.getReserved("page"):_items.h["page"])};
		_info.chars.h[_char.id] = _char;
		break;
	case "kerning":
		var _first = Std.parseInt(__map_reserved.first != null?_items.getReserved("first"):_items.h["first"]);
		var _second = Std.parseInt(__map_reserved.second != null?_items.getReserved("second"):_items.h["second"]);
		var _amount = Std.parseFloat(__map_reserved.amount != null?_items.getReserved("amount"):_items.h["amount"]);
		var _map = _info.kernings.h[_first];
		if(_map == null) {
			_map = new haxe_ds_IntMap();
			_info.kernings.h[_first] = _map;
		}
		_map.h[_second] = _amount;
		break;
	default:
	}
	_items = null;
};
luxe_importers_bitmapfont_BitmapFontParser.tokenize_line = function(_tokens) {
	var _item_map = new haxe_ds_StringMap();
	var _g = 0;
	while(_g < _tokens.length) {
		var _token = _tokens[_g];
		++_g;
		var _items = _token.split("=");
		_item_map.set(_items[0],_items[1]);
		_items = null;
	}
	return _item_map;
};
luxe_importers_bitmapfont_BitmapFontParser.trim = function(_s) {
	return StringTools.trim(_s);
};
luxe_importers_bitmapfont_BitmapFontParser.unquote = function(_s) {
	if(_s.indexOf("\"") != -1) _s = StringTools.replace(_s,"\"","");
	return _s;
};
var luxe_macros_BuildVersion = function() { };
$hxClasses["luxe.macros.BuildVersion"] = luxe_macros_BuildVersion;
luxe_macros_BuildVersion.__name__ = ["luxe","macros","BuildVersion"];
luxe_macros_BuildVersion.try_git = function(root) {
	return "";
};
var luxe_options__$DrawOptions_DrawOptions = function() { };
$hxClasses["luxe.options._DrawOptions.DrawOptions"] = luxe_options__$DrawOptions_DrawOptions;
luxe_options__$DrawOptions_DrawOptions.__name__ = ["luxe","options","_DrawOptions","DrawOptions"];
var luxe_resource_Resource = function(_options) {
	this.ref = 0;
	if(_options == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options was null" + ""));
	if(_options.id == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options.id was null" + ""));
	if(_options.system == null) _options.system = Luxe.resources;
	_options.system;
	if(_options.resource_type == null) _options.resource_type = 0;
	_options.resource_type;
	this.id = _options.id;
	this.system = _options.system;
	this.resource_type = _options.resource_type;
	this.set_state(0);
	this.set_ref(1);
};
$hxClasses["luxe.resource.Resource"] = luxe_resource_Resource;
luxe_resource_Resource.__name__ = ["luxe","resource","Resource"];
luxe_resource_Resource.prototype = {
	destroy: function(_force) {
		if(_force == null) _force = false;
		if(!(this.state != 6)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("state != ResourceState.destroyed" + ""));
		if(!_force) {
			if(!(this.ref > 0)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("ref > 0" + ""));
			var _g = this;
			var _g1 = _g.ref;
			_g.set_ref(_g1 - 1);
			_g1;
			if(!(this.ref >= 0)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("ref >= 0" + ""));
		}
		if(this.ref == 0 || _force) {
			this.clear();
			this.set_state(6);
			this.system.remove(this);
			this.system.emit(8,this);
		}
	}
	,invalidate: function() {
		if(!(this.state != 6)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("state != ResourceState.destroyed" + ""));
		this.clear();
		this.set_state(5);
		this.system.emit(6,this);
	}
	,reload: function() {
		return null;
	}
	,memory_use: function() {
		return 0;
	}
	,set_ref: function(_ref) {
		var pre = this.ref;
		this.ref = _ref;
		if(this.ref > pre) this.system.emit(9,this); else if(this.ref < pre) this.system.emit(10,this);
		return this.ref;
	}
	,set_state: function(_state) {
		this.state = _state;
		var _g = this.state;
		switch(_g) {
		case 2:
			this.system.emit(3,this);
			break;
		case 3:
			this.system.emit(4,this);
			break;
		case 4:
			this.system.emit(5,this);
			break;
		default:
		}
		return this.state;
	}
	,clear: function() {
	}
	,state_string: function() {
		var _g = this.state;
		switch(_g) {
		case 1:
			return "listed";
		case 2:
			return "loading";
		case 3:
			return "loaded";
		case 4:
			return "failed";
		case 5:
			return "invalidated";
		case 6:
			return "destroyed";
		default:
			return "unknown";
		}
	}
	,type_string: function() {
		var _g = this.resource_type;
		switch(_g) {
		case 3:
			return "bytes";
		case 1:
			return "text";
		case 2:
			return "json";
		case 4:
			return "texture";
		case 7:
			return "shader";
		case 6:
			return "font";
		default:
			return "" + this.resource_type;
		}
	}
	,toString: function() {
		return "Resource(`" + this.id + "`, " + this.type_string() + ", " + this.state_string() + ")";
	}
	,__class__: luxe_resource_Resource
	,__properties__: {set_ref:"set_ref",set_state:"set_state"}
};
var luxe_resource_BytesResource = function(_options) {
	if(_options == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options was null" + ""));
	_options.resource_type = 3;
	luxe_resource_Resource.call(this,_options);
	this.asset = _options.asset;
};
$hxClasses["luxe.resource.BytesResource"] = luxe_resource_BytesResource;
luxe_resource_BytesResource.__name__ = ["luxe","resource","BytesResource"];
luxe_resource_BytesResource.__super__ = luxe_resource_Resource;
luxe_resource_BytesResource.prototype = $extend(luxe_resource_Resource.prototype,{
	reload: function() {
		var _g = this;
		if(!(this.state != 6)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("state != ResourceState.destroyed" + ""));
		this.clear();
		return new snow_api_Promise(function(resolve,reject) {
			_g.set_state(2);
			var get = snow_systems_assets_AssetBytes.load(Luxe.core.app.assets,_g.id);
			get.then(function(_asset) {
				_g.asset = _asset;
				_g.set_state(3);
				resolve(_g);
			});
			get.error(function(_error) {
				_g.set_state(4);
				reject(_error);
			});
		});
	}
	,clear: function() {
		if(this.asset != null) {
			this.asset.destroy();
			this.asset = null;
		}
	}
	,memory_use: function() {
		if(this.asset == null) return 0;
		return this.asset.bytes.byteLength;
	}
	,__class__: luxe_resource_BytesResource
});
var luxe_resource_TextResource = function(_options) {
	if(_options == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options was null" + ""));
	_options.resource_type = 1;
	luxe_resource_Resource.call(this,_options);
	this.asset = _options.asset;
};
$hxClasses["luxe.resource.TextResource"] = luxe_resource_TextResource;
luxe_resource_TextResource.__name__ = ["luxe","resource","TextResource"];
luxe_resource_TextResource.__super__ = luxe_resource_Resource;
luxe_resource_TextResource.prototype = $extend(luxe_resource_Resource.prototype,{
	reload: function() {
		var _g = this;
		if(!(this.state != 6)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("state != ResourceState.destroyed" + ""));
		this.clear();
		return new snow_api_Promise(function(resolve,reject) {
			_g.set_state(2);
			var get = snow_systems_assets_AssetText.load(Luxe.core.app.assets,_g.id);
			get.then(function(_asset) {
				_g.asset = _asset;
				_g.set_state(3);
				resolve(_g);
			});
			get.error(function(_error) {
				_g.set_state(4);
				reject(_error);
			});
		});
	}
	,clear: function() {
		if(this.asset != null) {
			this.asset.destroy();
			this.asset = null;
		}
	}
	,memory_use: function() {
		if(this.asset == null) return 0;
		return this.asset.text.length;
	}
	,__class__: luxe_resource_TextResource
});
var luxe_resource_JSONResource = function(_options) {
	if(_options == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options was null" + ""));
	_options.resource_type = 2;
	luxe_resource_Resource.call(this,_options);
	this.asset = _options.asset;
};
$hxClasses["luxe.resource.JSONResource"] = luxe_resource_JSONResource;
luxe_resource_JSONResource.__name__ = ["luxe","resource","JSONResource"];
luxe_resource_JSONResource.__super__ = luxe_resource_Resource;
luxe_resource_JSONResource.prototype = $extend(luxe_resource_Resource.prototype,{
	reload: function() {
		var _g = this;
		if(!(this.state != 6)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("state != ResourceState.destroyed" + ""));
		this.clear();
		return new snow_api_Promise(function(resolve,reject) {
			_g.set_state(2);
			var get = snow_systems_assets_AssetJSON.load(Luxe.core.app.assets,_g.id);
			get.then(function(_asset) {
				_g.asset = _asset;
				_g.set_state(3);
				resolve(_g);
			});
			get.error(function(_error) {
				_g.set_state(4);
				reject(_error);
			});
		});
	}
	,clear: function() {
		if(this.asset != null) {
			this.asset.destroy();
			this.asset = null;
		}
	}
	,__class__: luxe_resource_JSONResource
});
var luxe_resource_AudioResource = function(_options) {
	this.is_stream = false;
	if(_options == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options was null" + ""));
	_options.resource_type = 8;
	luxe_resource_Resource.call(this,_options);
	this.asset = _options.asset;
	if(_options.is_stream == null) _options.is_stream = false;
	this.is_stream = _options.is_stream;
	if(this.asset != null) this.source = new snow_systems_audio_AudioSource(Luxe.core.app,this.asset.audio);
};
$hxClasses["luxe.resource.AudioResource"] = luxe_resource_AudioResource;
luxe_resource_AudioResource.__name__ = ["luxe","resource","AudioResource"];
luxe_resource_AudioResource.__super__ = luxe_resource_Resource;
luxe_resource_AudioResource.prototype = $extend(luxe_resource_Resource.prototype,{
	reload: function() {
		var _g = this;
		if(!(this.state != 6)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("state != ResourceState.destroyed" + ""));
		this.clear();
		return new snow_api_Promise(function(resolve,reject) {
			_g.set_state(2);
			var get = snow_systems_assets_AssetAudio.load(Luxe.core.app.assets,_g.id,_g.is_stream);
			get.then(function(_asset) {
				_g.asset = _asset;
				_g.source = new snow_systems_audio_AudioSource(Luxe.core.app,_g.asset.audio);
				_g.set_state(3);
				resolve(_g);
			});
			get.error(function(_error) {
				_g.set_state(4);
				reject(_error);
			});
		});
	}
	,clear: function() {
		if(this.asset != null) {
			this.asset.destroy();
			this.asset = null;
		}
		if(this.source != null) {
			this.source.destroy();
			this.source = null;
		}
	}
	,__class__: luxe_resource_AudioResource
});
var luxe_structural_BalancedBST = function(compare_function) {
	this.compare = compare_function;
};
$hxClasses["luxe.structural.BalancedBST"] = luxe_structural_BalancedBST;
luxe_structural_BalancedBST.__name__ = ["luxe","structural","BalancedBST"];
luxe_structural_BalancedBST.prototype = {
	size: function() {
		return this.node_count(this.root);
	}
	,depth: function() {
		return this.node_depth(this.root);
	}
	,insert: function(_key,_value) {
		this.root = this.node_insert(this.root,_key,_value);
		this.root.color = false;
	}
	,contains: function(_key) {
		return this.find(_key) != null;
	}
	,find: function(_key) {
		return this.node_find(this.root,_key);
	}
	,rank: function(_key) {
		return this.node_rank(_key,this.root);
	}
	,select: function(_rank) {
		var _node = this.node_select(this.root,_rank);
		if(_node != null) return _node.key; else return null;
	}
	,smallest: function() {
		var _node = this.node_smallest(this.root);
		if(_node != null) return _node.key; else return null;
	}
	,largest: function() {
		var _node = this.node_largest(this.root);
		if(_node != null) return _node.key; else return null;
	}
	,remove: function(_key) {
		if(!this.is_red(this.root.left) && !this.is_red(this.root.right)) this.root.color = true;
		if(!this.contains(_key)) return false;
		this.root = this.node_remove(this.root,_key);
		if(this.root != null) this.root.color = false;
		return true;
	}
	,remove_smallest: function() {
		if(!this.is_red(this.root.left) && !this.is_red(this.root.right)) this.root.color = true;
		this.root = this.node_remove_smallest(this.root);
		if(this.root != null) this.root.color = false;
		return true;
	}
	,remove_largest: function() {
		if(!this.is_red(this.root.left) && !this.is_red(this.root.right)) this.root.color = true;
		this.root = this.node_remove_largest(this.root);
		if(this.root != null) this.root.color = false;
		return true;
	}
	,floor: function(_key) {
		var _node = this.node_floor(this.root,_key);
		if(_node == null) return null;
		return _node.key;
	}
	,ceil: function(_key) {
		var _node = this.node_ceil(this.root,_key);
		if(_node == null) return null;
		return _node.key;
	}
	,toArray: function() {
		var a = [];
		this.traverse_node(this.root,luxe_structural_BalancedBSTTraverseMethod.order_retain,function(_node) {
			a.push(_node.value);
		});
		return a;
	}
	,keys: function() {
		var a = [];
		this.traverse_node(this.root,luxe_structural_BalancedBSTTraverseMethod.order_retain,function(_node) {
			a.push(_node.key);
		});
		return a;
	}
	,iterator: function() {
		return new luxe_structural_BalancedBSTIterator(this);
	}
	,traverse_node: function(_node,_method,_on_traverse) {
		if(_node != null) switch(_method[1]) {
		case 0:
			_on_traverse(_node);
			this.traverse_node(_node.left,_method,_on_traverse);
			this.traverse_node(_node.right,_method,_on_traverse);
			break;
		case 1:
			this.traverse_node(_node.left,_method,_on_traverse);
			_on_traverse(_node);
			this.traverse_node(_node.right,_method,_on_traverse);
			break;
		case 2:
			this.traverse_node(_node.left,_method,_on_traverse);
			this.traverse_node(_node.right,_method,_on_traverse);
			_on_traverse(_node);
			break;
		}
	}
	,get_empty: function() {
		return this.root == null;
	}
	,node_depth: function(_node) {
		if(_node == null) return 0;
		var _n_depth = Math.max(this.node_depth(_node.left),this.node_depth(_node.right));
		return 1 + (_n_depth | 0);
	}
	,node_count: function(_node) {
		if(_node == null) return 0; else return _node.nodecount;
	}
	,node_insert: function(_node,_key,_value) {
		if(_node == null) return new luxe_structural_BalancedBSTNode(_key,_value,1,true);
		var comparison = this.compare(_key,_node.key);
		if(comparison < 0) _node.left = this.node_insert(_node.left,_key,_value); else if(comparison > 0) _node.right = this.node_insert(_node.right,_key,_value); else _node.value = _value;
		if(this.is_red(_node.right) && !this.is_red(_node.left)) _node = this.rotate_left(_node);
		if(this.is_red(_node.left) && this.is_red(_node.left.left)) _node = this.rotate_right(_node);
		if(this.is_red(_node.left) && this.is_red(_node.right)) this.swap_color(_node);
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return _node;
	}
	,node_update_count: function(_node) {
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		return _node;
	}
	,node_find: function(_node,_key) {
		if(_node == null) return null;
		var comparison = this.compare(_key,_node.key);
		if(comparison < 0) return this.node_find(_node.left,_key); else if(comparison > 0) return this.node_find(_node.right,_key); else return _node.value;
	}
	,node_rank: function(_key,_node) {
		if(_node == null) return 0;
		var comparison = this.compare(_key,_node.key);
		if(comparison < 0) return this.node_rank(_key,_node.left); else if(comparison > 0) return 1 + this.node_count(_node.left) + this.node_rank(_key,_node.right); else return this.node_count(_node.left);
	}
	,node_select: function(_node,_rank) {
		if(_node == null) return null;
		var _r = this.node_count(_node.left);
		if(_r > _rank) return this.node_select(_node.left,_rank); else if(_r < _rank) return this.node_select(_node.right,_rank - _r - 1); else return _node;
	}
	,node_smallest: function(_node) {
		if(_node.left == null) return _node;
		return this.node_smallest(_node.left);
	}
	,node_largest: function(_node) {
		if(_node.right == null) return _node; else return this.node_largest(_node.right);
	}
	,node_floor: function(_node,_key) {
		if(_node == null) return null;
		var comparison = this.compare(_key,_node.key);
		if(comparison == 0) return _node; else if(comparison < 0) return this.node_floor(_node.left,_key);
		var _n = this.node_floor(_node.right,_key);
		if(_n != null) return _n; else return _node;
	}
	,node_ceil: function(_node,_key) {
		if(_node == null) return null;
		var comparison = this.compare(_key,_node.key);
		if(comparison == 0) return _node; else if(comparison < 0) {
			var _n = this.node_ceil(_node.left,_key);
			if(_n != null) return _n; else return _node;
		}
		return this.node_ceil(_node.right,_key);
	}
	,node_remove_smallest: function(_node) {
		if(_node.left == null) return null;
		if(!this.is_red(_node.left) && !this.is_red(_node.left.left)) _node = this.move_red_left(_node);
		_node.left = this.node_remove_smallest(_node.left);
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return this.balance(_node);
	}
	,node_remove_largest: function(_node) {
		if(this.is_red(_node.left)) _node = this.rotate_right(_node);
		if(_node.right == null) return null;
		if(!this.is_red(_node.right) && !this.is_red(_node.right.left)) _node = this.move_red_right(_node);
		_node.right = this.node_remove_largest(_node.right);
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return this.balance(_node);
	}
	,node_remove: function(_node,_key) {
		var comparison = this.compare(_key,_node.key);
		if(comparison < 0) {
			if(!this.is_red(_node.left) && !this.is_red(_node.left.left)) _node = this.move_red_left(_node);
			_node.left = this.node_remove(_node.left,_key);
		} else {
			if(this.is_red(_node.left)) _node = this.rotate_right(_node);
			var comparison1 = this.compare(_key,_node.key);
			if(comparison1 == 0 && _node.right == null) return null;
			if(!this.is_red(_node.right) && !this.is_red(_node.right.left)) _node = this.move_red_right(_node);
			var comparison2 = this.compare(_key,_node.key);
			if(comparison2 == 0) {
				var _n = this.node_smallest(_node.right);
				_node.key = _n.key;
				_node.value = _n.value;
				_node.right = this.node_remove_smallest(_node.right);
			} else _node.right = this.node_remove(_node.right,_key);
		}
		return this.balance(_node);
	}
	,is_red: function(_node) {
		if(_node == null) return false;
		return _node.color == true;
	}
	,rotate_left: function(_node) {
		var _n = _node.right;
		_n.color = _node.color;
		_node.color = true;
		_node.right = _n.left;
		_n.left = _node;
		_n.nodecount = _node.nodecount;
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return _n;
	}
	,rotate_right: function(_node) {
		var _n = _node.left;
		_n.color = _node.color;
		_node.color = true;
		_node.left = _n.right;
		_n.right = _node;
		_n.nodecount = _node.nodecount;
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return _n;
	}
	,swap_color: function(_node) {
		_node.color = !_node.color;
		_node.left.color = !_node.left.color;
		_node.right.color = !_node.right.color;
	}
	,move_red_left: function(_node) {
		this.swap_color(_node);
		if(this.is_red(_node.right.left)) {
			_node.right = this.rotate_right(_node.right);
			_node = this.rotate_left(_node);
		}
		return _node;
	}
	,move_red_right: function(_node) {
		this.swap_color(_node);
		if(this.is_red(_node.left.left)) _node = this.rotate_right(_node);
		return _node;
	}
	,balance: function(_node) {
		if(this.is_red(_node.right)) _node = this.rotate_left(_node);
		if(this.is_red(_node.left) && this.is_red(_node.left.left)) _node = this.rotate_right(_node);
		if(this.is_red(_node.left) && this.is_red(_node.right)) this.swap_color(_node);
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return _node;
	}
	,__class__: luxe_structural_BalancedBST
	,__properties__: {get_empty:"get_empty"}
};
var luxe_structural_BalancedBSTIterator = function(_tree) {
	if(_tree == null) return;
	if(_tree.root == null) return;
	this.tree = _tree;
	this.current = this._min(this.tree.root);
	this.rightest = this._max(this.tree.root);
};
$hxClasses["luxe.structural.BalancedBSTIterator"] = luxe_structural_BalancedBSTIterator;
luxe_structural_BalancedBSTIterator.__name__ = ["luxe","structural","BalancedBSTIterator"];
luxe_structural_BalancedBSTIterator.prototype = {
	hasNext: function() {
		if(this.current == null || this.rightest == null) return false;
		return this.tree.compare(this.current.key,this.rightest.key) <= 0;
	}
	,next: function() {
		var _temp = this.current;
		this.current = this.update_next();
		return _temp.value;
	}
	,update_next: function() {
		if(!(this.current == null || this.rightest == null?false:this.tree.compare(this.current.key,this.rightest.key) <= 0)) return null;
		if(this.current.right != null) return this._min(this.current.right);
		var _next = null;
		var _temp = this.tree.root;
		while(_temp != null) {
			var _comp = this.tree.compare(this.current.key,_temp.key);
			if(_comp < 0) {
				_next = _temp;
				_temp = _temp.left;
			} else if(_comp > 0) _temp = _temp.right; else {
				this.current = _next;
				break;
			}
		}
		return _next;
	}
	,_min: function(_node) {
		while(_node.left != null) _node = _node.left;
		return _node;
	}
	,_max: function(_node) {
		while(_node.right != null) _node = _node.right;
		return _node;
	}
	,__class__: luxe_structural_BalancedBSTIterator
};
var luxe_structural__$BalancedBST_NodeColor = function() { };
$hxClasses["luxe.structural._BalancedBST.NodeColor"] = luxe_structural__$BalancedBST_NodeColor;
luxe_structural__$BalancedBST_NodeColor.__name__ = ["luxe","structural","_BalancedBST","NodeColor"];
var luxe_structural_BalancedBSTNode = function(_key,_value,_node_count,_color) {
	this.left = null;
	this.right = null;
	this.key = _key;
	this.value = _value;
	this.nodecount = _node_count;
	this.color = _color;
};
$hxClasses["luxe.structural.BalancedBSTNode"] = luxe_structural_BalancedBSTNode;
luxe_structural_BalancedBSTNode.__name__ = ["luxe","structural","BalancedBSTNode"];
luxe_structural_BalancedBSTNode.prototype = {
	__class__: luxe_structural_BalancedBSTNode
};
var luxe_structural_BalancedBSTTraverseMethod = $hxClasses["luxe.structural.BalancedBSTTraverseMethod"] = { __ename__ : ["luxe","structural","BalancedBSTTraverseMethod"], __constructs__ : ["order_pre","order_retain","order_post"] };
luxe_structural_BalancedBSTTraverseMethod.order_pre = ["order_pre",0];
luxe_structural_BalancedBSTTraverseMethod.order_pre.toString = $estr;
luxe_structural_BalancedBSTTraverseMethod.order_pre.__enum__ = luxe_structural_BalancedBSTTraverseMethod;
luxe_structural_BalancedBSTTraverseMethod.order_retain = ["order_retain",1];
luxe_structural_BalancedBSTTraverseMethod.order_retain.toString = $estr;
luxe_structural_BalancedBSTTraverseMethod.order_retain.__enum__ = luxe_structural_BalancedBSTTraverseMethod;
luxe_structural_BalancedBSTTraverseMethod.order_post = ["order_post",2];
luxe_structural_BalancedBSTTraverseMethod.order_post.toString = $estr;
luxe_structural_BalancedBSTTraverseMethod.order_post.__enum__ = luxe_structural_BalancedBSTTraverseMethod;
var luxe_structural_BalancedBSTIterator_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry = function(_tree) {
	if(_tree == null) return;
	if(_tree.root == null) return;
	this.tree = _tree;
	this.current = this._min(this.tree.root);
	this.rightest = this._max(this.tree.root);
};
$hxClasses["luxe.structural.BalancedBSTIterator_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry"] = luxe_structural_BalancedBSTIterator_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry;
luxe_structural_BalancedBSTIterator_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry.__name__ = ["luxe","structural","BalancedBSTIterator_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry"];
luxe_structural_BalancedBSTIterator_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry.prototype = {
	hasNext: function() {
		if(this.current == null || this.rightest == null) return false;
		return this.tree.compare(this.current.key,this.rightest.key) <= 0;
	}
	,next: function() {
		var _temp = this.current;
		this.current = this.update_next();
		return _temp.value;
	}
	,update_next: function() {
		if(!(this.current == null || this.rightest == null?false:this.tree.compare(this.current.key,this.rightest.key) <= 0)) return null;
		if(this.current.right != null) return this._min(this.current.right);
		var _next = null;
		var _temp = this.tree.root;
		while(_temp != null) {
			var _comp = this.tree.compare(this.current.key,_temp.key);
			if(_comp < 0) {
				_next = _temp;
				_temp = _temp.left;
			} else if(_comp > 0) _temp = _temp.right; else {
				this.current = _next;
				break;
			}
		}
		return _next;
	}
	,_min: function(_node) {
		while(_node.left != null) _node = _node.left;
		return _node;
	}
	,_max: function(_node) {
		while(_node.right != null) _node = _node.right;
		return _node;
	}
	,__class__: luxe_structural_BalancedBSTIterator_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry
};
var luxe_structural_BalancedBSTNode_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry = function(_key,_value,_node_count,_color) {
	this.left = null;
	this.right = null;
	this.key = _key;
	this.value = _value;
	this.nodecount = _node_count;
	this.color = _color;
};
$hxClasses["luxe.structural.BalancedBSTNode_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry"] = luxe_structural_BalancedBSTNode_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry;
luxe_structural_BalancedBSTNode_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry.__name__ = ["luxe","structural","BalancedBSTNode_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry"];
luxe_structural_BalancedBSTNode_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry.prototype = {
	__class__: luxe_structural_BalancedBSTNode_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry
};
var luxe_structural_BalancedBST_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry = function(compare_function) {
	this.compare = compare_function;
};
$hxClasses["luxe.structural.BalancedBST_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry"] = luxe_structural_BalancedBST_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry;
luxe_structural_BalancedBST_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry.__name__ = ["luxe","structural","BalancedBST_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry"];
luxe_structural_BalancedBST_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry.prototype = {
	size: function() {
		return this.node_count(this.root);
	}
	,depth: function() {
		return this.node_depth(this.root);
	}
	,insert: function(_key,_value) {
		this.root = this.node_insert(this.root,_key,_value);
		this.root.color = false;
	}
	,contains: function(_key) {
		return this.find(_key) != null;
	}
	,find: function(_key) {
		return this.node_find(this.root,_key);
	}
	,rank: function(_key) {
		return this.node_rank(_key,this.root);
	}
	,select: function(_rank) {
		var _node = this.node_select(this.root,_rank);
		if(_node != null) return _node.key; else return null;
	}
	,smallest: function() {
		var _node = this.node_smallest(this.root);
		if(_node != null) return _node.key; else return null;
	}
	,largest: function() {
		var _node = this.node_largest(this.root);
		if(_node != null) return _node.key; else return null;
	}
	,remove: function(_key) {
		if(!this.is_red(this.root.left) && !this.is_red(this.root.right)) this.root.color = true;
		if(!this.contains(_key)) return false;
		this.root = this.node_remove(this.root,_key);
		if(this.root != null) this.root.color = false;
		return true;
	}
	,remove_smallest: function() {
		if(!this.is_red(this.root.left) && !this.is_red(this.root.right)) this.root.color = true;
		this.root = this.node_remove_smallest(this.root);
		if(this.root != null) this.root.color = false;
		return true;
	}
	,remove_largest: function() {
		if(!this.is_red(this.root.left) && !this.is_red(this.root.right)) this.root.color = true;
		this.root = this.node_remove_largest(this.root);
		if(this.root != null) this.root.color = false;
		return true;
	}
	,floor: function(_key) {
		var _node = this.node_floor(this.root,_key);
		if(_node == null) return null;
		return _node.key;
	}
	,ceil: function(_key) {
		var _node = this.node_ceil(this.root,_key);
		if(_node == null) return null;
		return _node.key;
	}
	,toArray: function() {
		var a = [];
		this.traverse_node(this.root,luxe_structural_BalancedBSTTraverseMethod.order_retain,function(_node) {
			a.push(_node.value);
		});
		return a;
	}
	,keys: function() {
		var a = [];
		this.traverse_node(this.root,luxe_structural_BalancedBSTTraverseMethod.order_retain,function(_node) {
			a.push(_node.key);
		});
		return a;
	}
	,iterator: function() {
		return new luxe_structural_BalancedBSTIterator_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry(this);
	}
	,traverse_node: function(_node,_method,_on_traverse) {
		if(_node != null) switch(_method[1]) {
		case 0:
			_on_traverse(_node);
			this.traverse_node(_node.left,_method,_on_traverse);
			this.traverse_node(_node.right,_method,_on_traverse);
			break;
		case 1:
			this.traverse_node(_node.left,_method,_on_traverse);
			_on_traverse(_node);
			this.traverse_node(_node.right,_method,_on_traverse);
			break;
		case 2:
			this.traverse_node(_node.left,_method,_on_traverse);
			this.traverse_node(_node.right,_method,_on_traverse);
			_on_traverse(_node);
			break;
		}
	}
	,get_empty: function() {
		return this.root == null;
	}
	,node_depth: function(_node) {
		if(_node == null) return 0;
		var _n_depth = Math.max(this.node_depth(_node.left),this.node_depth(_node.right));
		return 1 + (_n_depth | 0);
	}
	,node_count: function(_node) {
		if(_node == null) return 0; else return _node.nodecount;
	}
	,node_insert: function(_node,_key,_value) {
		if(_node == null) return new luxe_structural_BalancedBSTNode_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry(_key,_value,1,true);
		var comparison = this.compare(_key,_node.key);
		if(comparison < 0) _node.left = this.node_insert(_node.left,_key,_value); else if(comparison > 0) _node.right = this.node_insert(_node.right,_key,_value); else _node.value = _value;
		if(this.is_red(_node.right) && !this.is_red(_node.left)) _node = this.rotate_left(_node);
		if(this.is_red(_node.left) && this.is_red(_node.left.left)) _node = this.rotate_right(_node);
		if(this.is_red(_node.left) && this.is_red(_node.right)) this.swap_color(_node);
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return _node;
	}
	,node_update_count: function(_node) {
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		return _node;
	}
	,node_find: function(_node,_key) {
		if(_node == null) return null;
		var comparison = this.compare(_key,_node.key);
		if(comparison < 0) return this.node_find(_node.left,_key); else if(comparison > 0) return this.node_find(_node.right,_key); else return _node.value;
	}
	,node_rank: function(_key,_node) {
		if(_node == null) return 0;
		var comparison = this.compare(_key,_node.key);
		if(comparison < 0) return this.node_rank(_key,_node.left); else if(comparison > 0) return 1 + this.node_count(_node.left) + this.node_rank(_key,_node.right); else return this.node_count(_node.left);
	}
	,node_select: function(_node,_rank) {
		if(_node == null) return null;
		var _r = this.node_count(_node.left);
		if(_r > _rank) return this.node_select(_node.left,_rank); else if(_r < _rank) return this.node_select(_node.right,_rank - _r - 1); else return _node;
	}
	,node_smallest: function(_node) {
		if(_node.left == null) return _node;
		return this.node_smallest(_node.left);
	}
	,node_largest: function(_node) {
		if(_node.right == null) return _node; else return this.node_largest(_node.right);
	}
	,node_floor: function(_node,_key) {
		if(_node == null) return null;
		var comparison = this.compare(_key,_node.key);
		if(comparison == 0) return _node; else if(comparison < 0) return this.node_floor(_node.left,_key);
		var _n = this.node_floor(_node.right,_key);
		if(_n != null) return _n; else return _node;
	}
	,node_ceil: function(_node,_key) {
		if(_node == null) return null;
		var comparison = this.compare(_key,_node.key);
		if(comparison == 0) return _node; else if(comparison < 0) {
			var _n = this.node_ceil(_node.left,_key);
			if(_n != null) return _n; else return _node;
		}
		return this.node_ceil(_node.right,_key);
	}
	,node_remove_smallest: function(_node) {
		if(_node.left == null) return null;
		if(!this.is_red(_node.left) && !this.is_red(_node.left.left)) _node = this.move_red_left(_node);
		_node.left = this.node_remove_smallest(_node.left);
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return this.balance(_node);
	}
	,node_remove_largest: function(_node) {
		if(this.is_red(_node.left)) _node = this.rotate_right(_node);
		if(_node.right == null) return null;
		if(!this.is_red(_node.right) && !this.is_red(_node.right.left)) _node = this.move_red_right(_node);
		_node.right = this.node_remove_largest(_node.right);
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return this.balance(_node);
	}
	,node_remove: function(_node,_key) {
		var comparison = this.compare(_key,_node.key);
		if(comparison < 0) {
			if(!this.is_red(_node.left) && !this.is_red(_node.left.left)) _node = this.move_red_left(_node);
			_node.left = this.node_remove(_node.left,_key);
		} else {
			if(this.is_red(_node.left)) _node = this.rotate_right(_node);
			var comparison1 = this.compare(_key,_node.key);
			if(comparison1 == 0 && _node.right == null) return null;
			if(!this.is_red(_node.right) && !this.is_red(_node.right.left)) _node = this.move_red_right(_node);
			var comparison2 = this.compare(_key,_node.key);
			if(comparison2 == 0) {
				var _n = this.node_smallest(_node.right);
				_node.key = _n.key;
				_node.value = _n.value;
				_node.right = this.node_remove_smallest(_node.right);
			} else _node.right = this.node_remove(_node.right,_key);
		}
		return this.balance(_node);
	}
	,is_red: function(_node) {
		if(_node == null) return false;
		return _node.color == true;
	}
	,rotate_left: function(_node) {
		var _n = _node.right;
		_n.color = _node.color;
		_node.color = true;
		_node.right = _n.left;
		_n.left = _node;
		_n.nodecount = _node.nodecount;
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return _n;
	}
	,rotate_right: function(_node) {
		var _n = _node.left;
		_n.color = _node.color;
		_node.color = true;
		_node.left = _n.right;
		_n.right = _node;
		_n.nodecount = _node.nodecount;
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return _n;
	}
	,swap_color: function(_node) {
		_node.color = !_node.color;
		_node.left.color = !_node.left.color;
		_node.right.color = !_node.right.color;
	}
	,move_red_left: function(_node) {
		this.swap_color(_node);
		if(this.is_red(_node.right.left)) {
			_node.right = this.rotate_right(_node.right);
			_node = this.rotate_left(_node);
		}
		return _node;
	}
	,move_red_right: function(_node) {
		this.swap_color(_node);
		if(this.is_red(_node.left.left)) _node = this.rotate_right(_node);
		return _node;
	}
	,balance: function(_node) {
		if(this.is_red(_node.right)) _node = this.rotate_left(_node);
		if(this.is_red(_node.left) && this.is_red(_node.left.left)) _node = this.rotate_right(_node);
		if(this.is_red(_node.left) && this.is_red(_node.right)) this.swap_color(_node);
		_node.nodecount = this.node_count(_node.left) + this.node_count(_node.right) + 1;
		_node;
		return _node;
	}
	,__class__: luxe_structural_BalancedBST_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry
	,__properties__: {get_empty:"get_empty"}
};
var luxe_structural_OrderedMapIterator = function(omap) {
	this.index = 0;
	this.map = omap;
};
$hxClasses["luxe.structural.OrderedMapIterator"] = luxe_structural_OrderedMapIterator;
luxe_structural_OrderedMapIterator.__name__ = ["luxe","structural","OrderedMapIterator"];
luxe_structural_OrderedMapIterator.prototype = {
	hasNext: function() {
		return this.index < this.map._keys.length;
	}
	,next: function() {
		return this.map.get(this.map._keys[this.index++]);
	}
	,__class__: luxe_structural_OrderedMapIterator
};
var luxe_structural_OrderedMap = function(_map) {
	this.idx = 0;
	this._keys = [];
	this.map = _map;
};
$hxClasses["luxe.structural.OrderedMap"] = luxe_structural_OrderedMap;
luxe_structural_OrderedMap.__name__ = ["luxe","structural","OrderedMap"];
luxe_structural_OrderedMap.__interfaces__ = [haxe_IMap];
luxe_structural_OrderedMap.prototype = {
	set: function(key,value) {
		if(!this.map.exists(key)) this._keys.push(key);
		{
			this.map.set(key,value);
			value;
		}
	}
	,toString: function() {
		var _ret = "";
		var _cnt = 0;
		var _len = this._keys.length;
		var _g = 0;
		var _g1 = this._keys;
		while(_g < _g1.length) {
			var k = _g1[_g];
			++_g;
			_ret += "" + Std.string(k) + " => " + Std.string(this.map.get(k)) + (_cnt++ < _len - 1?", ":"");
		}
		return "{" + _ret + "}";
	}
	,iterator: function() {
		return new luxe_structural_OrderedMapIterator(this);
	}
	,remove: function(key) {
		return this.map.remove(key) && HxOverrides.remove(this._keys,key);
	}
	,exists: function(key) {
		return this.map.exists(key);
	}
	,get: function(key) {
		return this.map.get(key);
	}
	,keys: function() {
		return HxOverrides.iter(this._keys);
	}
	,__class__: luxe_structural_OrderedMap
};
var luxe_structural_OrderedMapIterator_$String_$luxe_$Component = function(omap) {
	this.index = 0;
	this.map = omap;
};
$hxClasses["luxe.structural.OrderedMapIterator_String_luxe_Component"] = luxe_structural_OrderedMapIterator_$String_$luxe_$Component;
luxe_structural_OrderedMapIterator_$String_$luxe_$Component.__name__ = ["luxe","structural","OrderedMapIterator_String_luxe_Component"];
luxe_structural_OrderedMapIterator_$String_$luxe_$Component.prototype = {
	hasNext: function() {
		return this.index < this.map._keys.length;
	}
	,next: function() {
		return this.map.get(this.map._keys[this.index++]);
	}
	,__class__: luxe_structural_OrderedMapIterator_$String_$luxe_$Component
};
var luxe_structural_OrderedMap_$String_$luxe_$Component = function(_map) {
	this.idx = 0;
	this._keys = [];
	this.map = _map;
};
$hxClasses["luxe.structural.OrderedMap_String_luxe_Component"] = luxe_structural_OrderedMap_$String_$luxe_$Component;
luxe_structural_OrderedMap_$String_$luxe_$Component.__name__ = ["luxe","structural","OrderedMap_String_luxe_Component"];
luxe_structural_OrderedMap_$String_$luxe_$Component.__interfaces__ = [haxe_IMap];
luxe_structural_OrderedMap_$String_$luxe_$Component.prototype = {
	set: function(key,value) {
		if(!this.map.exists(key)) this._keys.push(key);
		{
			this.map.set(key,value);
			value;
		}
	}
	,toString: function() {
		var _ret = "";
		var _cnt = 0;
		var _len = this._keys.length;
		var _g = 0;
		var _g1 = this._keys;
		while(_g < _g1.length) {
			var k = _g1[_g];
			++_g;
			_ret += "" + (k == null?"null":"" + k) + " => " + Std.string(this.map.get(k)) + (_cnt++ < _len - 1?", ":"");
		}
		return "{" + _ret + "}";
	}
	,iterator: function() {
		return new luxe_structural_OrderedMapIterator_$String_$luxe_$Component(this);
	}
	,remove: function(key) {
		return this.map.remove(key) && HxOverrides.remove(this._keys,key);
	}
	,exists: function(key) {
		return this.map.exists(key);
	}
	,get: function(key) {
		return this.map.get(key);
	}
	,keys: function() {
		return HxOverrides.iter(this._keys);
	}
	,__class__: luxe_structural_OrderedMap_$String_$luxe_$Component
};
var luxe_tween_actuators_IGenericActuator = function() { };
$hxClasses["luxe.tween.actuators.IGenericActuator"] = luxe_tween_actuators_IGenericActuator;
luxe_tween_actuators_IGenericActuator.__name__ = ["luxe","tween","actuators","IGenericActuator"];
luxe_tween_actuators_IGenericActuator.prototype = {
	__class__: luxe_tween_actuators_IGenericActuator
};
var luxe_tween_actuators_GenericActuator = function(target,duration,properties) {
	this.timescaled = false;
	this._autoVisible = true;
	this._delay = 0;
	this._reflect = false;
	this._repeat = 0;
	this._reverse = false;
	this._smartRotation = false;
	this._snapping = false;
	this.special = false;
	this.target = target;
	this.properties = properties;
	this.duration = duration;
	this._ease = luxe_tween_Actuate.defaultEase;
};
$hxClasses["luxe.tween.actuators.GenericActuator"] = luxe_tween_actuators_GenericActuator;
luxe_tween_actuators_GenericActuator.__name__ = ["luxe","tween","actuators","GenericActuator"];
luxe_tween_actuators_GenericActuator.__interfaces__ = [luxe_tween_actuators_IGenericActuator];
luxe_tween_actuators_GenericActuator.prototype = {
	apply: function() {
		var _g = 0;
		var _g1 = Reflect.fields(this.properties);
		while(_g < _g1.length) {
			var i = _g1[_g];
			++_g;
			if(Object.prototype.hasOwnProperty.call(this.target,i)) Reflect.setField(this.target,i,Reflect.field(this.properties,i)); else Reflect.setProperty(this.target,i,Reflect.field(this.properties,i));
		}
	}
	,autoVisible: function(value) {
		if(value == null) value = true;
		this._autoVisible = value;
		return this;
	}
	,callMethod: function(method,params) {
		if(params == null) params = [];
		return Reflect.callMethod(method,method,params);
	}
	,change: function() {
		if(this._onUpdate != null) this.callMethod(this._onUpdate,this._onUpdateParams);
	}
	,complete: function(sendEvent) {
		if(sendEvent == null) sendEvent = true;
		if(sendEvent) {
			this.change();
			if(this._onComplete != null) this.callMethod(this._onComplete,this._onCompleteParams);
		}
		luxe_tween_Actuate.unload(this);
	}
	,delay: function(duration) {
		this._delay = duration;
		return this;
	}
	,ease: function(easing) {
		this._ease = easing;
		return this;
	}
	,move: function() {
	}
	,timescale: function(_value) {
		if(_value == null) _value = true;
		this.timescaled = _value;
		return this;
	}
	,onComplete: function(handler,parameters) {
		this._onComplete = handler;
		if(parameters == null) this._onCompleteParams = []; else this._onCompleteParams = parameters;
		if(this.duration == 0) this.complete();
		return this;
	}
	,onRepeat: function(handler,parameters) {
		this._onRepeat = handler;
		if(parameters == null) this._onRepeatParams = []; else this._onRepeatParams = parameters;
		return this;
	}
	,onUpdate: function(handler,parameters) {
		this._onUpdate = handler;
		if(parameters == null) this._onUpdateParams = []; else this._onUpdateParams = parameters;
		return this;
	}
	,pause: function() {
	}
	,reflect: function(value) {
		if(value == null) value = true;
		this._reflect = value;
		this.special = true;
		return this;
	}
	,repeat: function(times) {
		if(times == null) times = -1;
		this._repeat = times;
		return this;
	}
	,resume: function() {
	}
	,reverse: function(value) {
		if(value == null) value = true;
		this._reverse = value;
		this.special = true;
		return this;
	}
	,smartRotation: function(value) {
		if(value == null) value = true;
		this._smartRotation = value;
		this.special = true;
		return this;
	}
	,snapping: function(value) {
		if(value == null) value = true;
		this._snapping = value;
		this.special = true;
		return this;
	}
	,stop: function(properties,complete,sendEvent) {
	}
	,__class__: luxe_tween_actuators_GenericActuator
};
var luxe_tween_actuators_SimpleActuator = function(target,duration,properties) {
	this.has_timescaled_starttime = false;
	this.active = true;
	this.propertyDetails = [];
	this.sendChange = false;
	this.paused = false;
	this.cacheVisible = false;
	this.initialized = false;
	this.setVisible = false;
	this.toggleVisible = false;
	this.startTime = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
	luxe_tween_actuators_GenericActuator.call(this,target,duration,properties);
	if(!luxe_tween_actuators_SimpleActuator.addedEvent) {
		luxe_tween_actuators_SimpleActuator.addedEvent = true;
		Luxe.on(4,luxe_tween_actuators_SimpleActuator.on_internal_update);
	}
};
$hxClasses["luxe.tween.actuators.SimpleActuator"] = luxe_tween_actuators_SimpleActuator;
luxe_tween_actuators_SimpleActuator.__name__ = ["luxe","tween","actuators","SimpleActuator"];
luxe_tween_actuators_SimpleActuator.on_internal_update = function(_) {
	luxe_tween_actuators_SimpleActuator.update_timer += Luxe.core.frame_delta;
	luxe_tween_actuators_SimpleActuator.current_time = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
	var currentTime = luxe_tween_actuators_SimpleActuator.current_time;
	var actuator;
	var j = 0;
	var cleanup = false;
	var _g1 = 0;
	var _g = luxe_tween_actuators_SimpleActuator.actuatorsLength;
	while(_g1 < _g) {
		var i = _g1++;
		actuator = luxe_tween_actuators_SimpleActuator.actuators[j];
		if(actuator != null && actuator.active) {
			if(actuator.timescaled) currentTime = luxe_tween_actuators_SimpleActuator.update_timer; else currentTime = luxe_tween_actuators_SimpleActuator.current_time;
			if(actuator.timescaled && !actuator.has_timescaled_starttime) {
				actuator.has_timescaled_starttime = true;
				actuator.startTime = luxe_tween_actuators_SimpleActuator.update_timer;
				actuator.timeOffset = actuator.startTime;
			}
			if(currentTime > actuator.timeOffset) actuator.update(currentTime);
			j++;
		} else {
			luxe_tween_actuators_SimpleActuator.actuators.splice(j,1);
			--luxe_tween_actuators_SimpleActuator.actuatorsLength;
		}
	}
};
luxe_tween_actuators_SimpleActuator.__super__ = luxe_tween_actuators_GenericActuator;
luxe_tween_actuators_SimpleActuator.prototype = $extend(luxe_tween_actuators_GenericActuator.prototype,{
	autoVisible: function(value) {
		if(value == null) value = true;
		this._autoVisible = value;
		if(!value) {
			this.toggleVisible = false;
			if(this.setVisible) this.setField(this.target,"visible",this.cacheVisible);
		}
		return this;
	}
	,delay: function(duration) {
		this._delay = duration;
		this.timeOffset = this.startTime + duration;
		return this;
	}
	,getField: function(target,propertyName) {
		var value = null;
		if(Object.prototype.hasOwnProperty.call(target,propertyName)) value = Reflect.field(target,propertyName); else value = Reflect.getProperty(target,propertyName);
		return value;
	}
	,initialize: function() {
		var details;
		var start;
		var _g = 0;
		var _g1 = Reflect.fields(this.properties);
		while(_g < _g1.length) {
			var i = _g1[_g];
			++_g;
			var isField = true;
			if(Object.prototype.hasOwnProperty.call(this.target,i) && (!this.target.__properties__ || !this.target.__properties__["set_" + i])) start = Reflect.field(this.target,i); else {
				isField = false;
				start = Reflect.getProperty(this.target,i);
			}
			if(typeof(start) == "number") {
				details = new luxe_tween_actuators_PropertyDetails(this.target,i,start,this.getField(this.properties,i) - start,isField);
				this.propertyDetails.push(details);
			}
		}
		this.detailsLength = this.propertyDetails.length;
		this.initialized = true;
	}
	,move: function() {
		this.toggleVisible = Object.prototype.hasOwnProperty.call(this.properties,"alpha") && Object.prototype.hasOwnProperty.call(this.properties,"visible");
		if(this.toggleVisible && this.properties.alpha != 0 && !this.getField(this.target,"visible")) {
			this.setVisible = true;
			this.cacheVisible = this.getField(this.target,"visible");
			this.setField(this.target,"visible",true);
		}
		this.timeOffset = this.startTime;
		luxe_tween_actuators_SimpleActuator.actuators.push(this);
		++luxe_tween_actuators_SimpleActuator.actuatorsLength;
	}
	,onUpdate: function(handler,parameters) {
		this._onUpdate = handler;
		if(parameters == null) this._onUpdateParams = []; else this._onUpdateParams = parameters;
		this.sendChange = true;
		return this;
	}
	,pause: function() {
		this.paused = true;
		if(this.timescaled) this.pauseTime = luxe_tween_actuators_SimpleActuator.update_timer; else this.pauseTime = luxe_tween_actuators_SimpleActuator.current_time;
	}
	,resume: function() {
		if(this.paused) {
			this.paused = false;
			this.timeOffset += (this.timescaled?luxe_tween_actuators_SimpleActuator.update_timer:luxe_tween_actuators_SimpleActuator.current_time) - this.pauseTime;
		}
	}
	,setField: function(target,propertyName,value) {
		if(Object.prototype.hasOwnProperty.call(target,propertyName)) target[propertyName] = value; else Reflect.setProperty(target,propertyName,value);
	}
	,setProperty: function(details,value) {
		if(details.isField) Reflect.setProperty(details.target,details.propertyName,value); else Reflect.setProperty(details.target,details.propertyName,value);
	}
	,stop: function(properties,complete,sendEvent) {
		if(this.active) {
			if(properties == null) {
				this.active = false;
				if(complete) this.apply();
				this.complete(sendEvent);
				return;
			}
			var _g = 0;
			var _g1 = Reflect.fields(properties);
			while(_g < _g1.length) {
				var i = _g1[_g];
				++_g;
				if(Object.prototype.hasOwnProperty.call(this.properties,i)) {
					this.active = false;
					if(complete) this.apply();
					this.complete(sendEvent);
					return;
				}
			}
		}
	}
	,update: function(currentTime) {
		if(!this.paused) {
			var details;
			var easing;
			var i;
			var tweenPosition = (currentTime - this.timeOffset) / this.duration;
			if(tweenPosition > 1) tweenPosition = 1;
			if(!this.initialized) this.initialize();
			if(!this.special) {
				easing = this._ease.calculate(tweenPosition);
				var _g1 = 0;
				var _g = this.detailsLength;
				while(_g1 < _g) {
					var i1 = _g1++;
					details = this.propertyDetails[i1];
					this.setProperty(details,details.start + details.change * easing);
				}
			} else {
				if(!this._reverse) easing = this._ease.calculate(tweenPosition); else easing = this._ease.calculate(1 - tweenPosition);
				var endValue;
				var _g11 = 0;
				var _g2 = this.detailsLength;
				while(_g11 < _g2) {
					var i2 = _g11++;
					details = this.propertyDetails[i2];
					if(this._smartRotation && (details.propertyName == "rotation" || details.propertyName == "rotationX" || details.propertyName == "rotationY" || details.propertyName == "rotationZ")) {
						var rotation = details.change % 360;
						if(rotation > 180) rotation -= 360; else if(rotation < -180) rotation += 360;
						endValue = details.start + rotation * easing;
					} else endValue = details.start + details.change * easing;
					if(!this._snapping) {
						if(details.isField) Reflect.setProperty(details.target,details.propertyName,endValue); else Reflect.setProperty(details.target,details.propertyName,endValue);
					} else this.setProperty(details,Math.round(endValue));
				}
			}
			if(tweenPosition == 1) {
				if(this._repeat == 0) {
					this.active = false;
					if(this.toggleVisible && this.getField(this.target,"alpha") == 0) this.setField(this.target,"visible",false);
					this.complete(true);
					return;
				} else {
					if(this._onRepeat != null) this.callMethod(this._onRepeat,this._onRepeatParams);
					if(this._reflect) this._reverse = !this._reverse;
					this.startTime = currentTime;
					this.timeOffset = this.startTime + this._delay;
					if(this._repeat > 0) this._repeat--;
				}
			}
			if(this.sendChange) this.change();
		}
	}
	,__class__: luxe_tween_actuators_SimpleActuator
});
var luxe_tween_easing_Quad = function() { };
$hxClasses["luxe.tween.easing.Quad"] = luxe_tween_easing_Quad;
luxe_tween_easing_Quad.__name__ = ["luxe","tween","easing","Quad"];
luxe_tween_easing_Quad.__properties__ = {get_easeOut:"get_easeOut",get_easeInOut:"get_easeInOut",get_easeIn:"get_easeIn"}
luxe_tween_easing_Quad.get_easeIn = function() {
	return new luxe_tween_easing_QuadEaseIn();
};
luxe_tween_easing_Quad.get_easeInOut = function() {
	return new luxe_tween_easing_QuadEaseInOut();
};
luxe_tween_easing_Quad.get_easeOut = function() {
	return new luxe_tween_easing_QuadEaseOut();
};
var luxe_tween_easing_IEasing = function() { };
$hxClasses["luxe.tween.easing.IEasing"] = luxe_tween_easing_IEasing;
luxe_tween_easing_IEasing.__name__ = ["luxe","tween","easing","IEasing"];
luxe_tween_easing_IEasing.prototype = {
	__class__: luxe_tween_easing_IEasing
};
var luxe_tween_easing_QuadEaseOut = function() {
};
$hxClasses["luxe.tween.easing.QuadEaseOut"] = luxe_tween_easing_QuadEaseOut;
luxe_tween_easing_QuadEaseOut.__name__ = ["luxe","tween","easing","QuadEaseOut"];
luxe_tween_easing_QuadEaseOut.__interfaces__ = [luxe_tween_easing_IEasing];
luxe_tween_easing_QuadEaseOut.prototype = {
	calculate: function(k) {
		return -k * (k - 2);
	}
	,ease: function(t,b,c,d) {
		return -c * (t /= d) * (t - 2) + b;
	}
	,__class__: luxe_tween_easing_QuadEaseOut
};
var luxe_tween_Actuate = function() { };
$hxClasses["luxe.tween.Actuate"] = luxe_tween_Actuate;
luxe_tween_Actuate.__name__ = ["luxe","tween","Actuate"];
luxe_tween_Actuate.apply = function(target,properties,customActuator) {
	luxe_tween_Actuate.stop(target,properties);
	if(customActuator == null) customActuator = luxe_tween_Actuate.defaultActuator;
	var actuator = Type.createInstance(customActuator,[target,0,properties]);
	actuator.apply();
	return actuator;
};
luxe_tween_Actuate.getLibrary = function(target,allowCreation) {
	if(allowCreation == null) allowCreation = true;
	if(!luxe_tween_Actuate.targetLibraries.exists(target) && allowCreation) luxe_tween_Actuate.targetLibraries.set(target,[]);
	return luxe_tween_Actuate.targetLibraries.get(target);
};
luxe_tween_Actuate.motionPath = function(target,duration,properties,overwrite) {
	if(overwrite == null) overwrite = true;
	return luxe_tween_Actuate.tween(target,duration,properties,overwrite,luxe_tween_actuators_MotionPathActuator);
};
luxe_tween_Actuate.pause = function(target) {
	if(js_Boot.__instanceof(target,luxe_tween_actuators_GenericActuator)) (js_Boot.__cast(target , luxe_tween_actuators_GenericActuator)).pause(); else {
		var library = luxe_tween_Actuate.getLibrary(target,false);
		if(library != null) {
			var _g = 0;
			while(_g < library.length) {
				var actuator = library[_g];
				++_g;
				actuator.pause();
			}
		}
	}
};
luxe_tween_Actuate.pauseAll = function() {
	var $it0 = luxe_tween_Actuate.targetLibraries.iterator();
	while( $it0.hasNext() ) {
		var library = $it0.next();
		var _g = 0;
		while(_g < library.length) {
			var actuator = library[_g];
			++_g;
			actuator.pause();
		}
	}
};
luxe_tween_Actuate.reset = function() {
	var $it0 = luxe_tween_Actuate.targetLibraries.iterator();
	while( $it0.hasNext() ) {
		var library = $it0.next();
		var i = library.length - 1;
		while(i >= 0) {
			library[i].stop(null,false,false);
			i--;
		}
	}
	luxe_tween_Actuate.targetLibraries = new haxe_ds_ObjectMap();
};
luxe_tween_Actuate.resume = function(target) {
	if(js_Boot.__instanceof(target,luxe_tween_actuators_GenericActuator)) (js_Boot.__cast(target , luxe_tween_actuators_GenericActuator)).resume(); else {
		var library = luxe_tween_Actuate.getLibrary(target,false);
		if(library != null) {
			var _g = 0;
			while(_g < library.length) {
				var actuator = library[_g];
				++_g;
				actuator.resume();
			}
		}
	}
};
luxe_tween_Actuate.resumeAll = function() {
	var $it0 = luxe_tween_Actuate.targetLibraries.iterator();
	while( $it0.hasNext() ) {
		var library = $it0.next();
		var _g = 0;
		while(_g < library.length) {
			var actuator = library[_g];
			++_g;
			actuator.resume();
		}
	}
};
luxe_tween_Actuate.stop = function(target,properties,complete,sendEvent) {
	if(sendEvent == null) sendEvent = true;
	if(complete == null) complete = false;
	if(target != null) {
		if(js_Boot.__instanceof(target,luxe_tween_actuators_GenericActuator)) (js_Boot.__cast(target , luxe_tween_actuators_GenericActuator)).stop(null,complete,sendEvent); else {
			var library = luxe_tween_Actuate.getLibrary(target,false);
			if(library != null) {
				if(typeof(properties) == "string") {
					var temp = { };
					Reflect.setField(temp,properties,null);
					properties = temp;
				} else if((properties instanceof Array) && properties.__enum__ == null) {
					var temp1 = { };
					var _g = 0;
					var _g1;
					_g1 = js_Boot.__cast(properties , Array);
					while(_g < _g1.length) {
						var property = _g1[_g];
						++_g;
						Reflect.setField(temp1,property,null);
					}
					properties = temp1;
				}
				var i = library.length - 1;
				while(i >= 0) {
					library[i].stop(properties,complete,sendEvent);
					i--;
				}
			}
		}
	}
};
luxe_tween_Actuate.timer = function(duration,customActuator) {
	return luxe_tween_Actuate.tween(new luxe_tween__$Actuate_TweenTimer(0),duration,new luxe_tween__$Actuate_TweenTimer(1),false,customActuator);
};
luxe_tween_Actuate.tween = function(target,duration,properties,overwrite,customActuator) {
	if(overwrite == null) overwrite = true;
	if(target != null) {
		if(duration > 0) {
			if(customActuator == null) customActuator = luxe_tween_Actuate.defaultActuator;
			var actuator = Type.createInstance(customActuator,[target,duration,properties]);
			var library = luxe_tween_Actuate.getLibrary(actuator.target);
			if(overwrite) {
				var i = library.length - 1;
				while(i >= 0) {
					library[i].stop(actuator.properties,false,false);
					i--;
				}
				library = luxe_tween_Actuate.getLibrary(actuator.target);
			}
			library.push(actuator);
			actuator.move();
			return actuator;
		} else return luxe_tween_Actuate.apply(target,properties,customActuator);
	}
	return null;
};
luxe_tween_Actuate.unload = function(actuator) {
	var target = actuator.target;
	if(luxe_tween_Actuate.targetLibraries.h.__keys__[target.__id__] != null) {
		HxOverrides.remove(luxe_tween_Actuate.targetLibraries.h[target.__id__],actuator);
		if(luxe_tween_Actuate.targetLibraries.h[target.__id__].length == 0) luxe_tween_Actuate.targetLibraries.remove(target);
	}
};
luxe_tween_Actuate.update = function(target,duration,start,end,overwrite) {
	if(overwrite == null) overwrite = true;
	var properties = { start : start, end : end};
	return luxe_tween_Actuate.tween(target,duration,properties,overwrite,luxe_tween_actuators_MethodActuator);
};
var luxe_tween__$Actuate_TweenTimer = function(progress) {
	this.progress = progress;
};
$hxClasses["luxe.tween._Actuate.TweenTimer"] = luxe_tween__$Actuate_TweenTimer;
luxe_tween__$Actuate_TweenTimer.__name__ = ["luxe","tween","_Actuate","TweenTimer"];
luxe_tween__$Actuate_TweenTimer.prototype = {
	__class__: luxe_tween__$Actuate_TweenTimer
};
var luxe_tween_MotionPath = function() {
	this._x = new luxe_tween_ComponentPath();
	this._y = new luxe_tween_ComponentPath();
	this._rotation = null;
};
$hxClasses["luxe.tween.MotionPath"] = luxe_tween_MotionPath;
luxe_tween_MotionPath.__name__ = ["luxe","tween","MotionPath"];
luxe_tween_MotionPath.prototype = {
	bezier: function(x,y,controlX,controlY,strength) {
		if(strength == null) strength = 1;
		this._x.addPath(new luxe_tween_BezierPath(x,controlX,strength));
		this._y.addPath(new luxe_tween_BezierPath(y,controlY,strength));
		return this;
	}
	,line: function(x,y,strength) {
		if(strength == null) strength = 1;
		this._x.addPath(new luxe_tween_LinearPath(x,strength));
		this._y.addPath(new luxe_tween_LinearPath(y,strength));
		return this;
	}
	,get_rotation: function() {
		if(this._rotation == null) this._rotation = new luxe_tween_RotationPath(this._x,this._y);
		return this._rotation;
	}
	,get_x: function() {
		return this._x;
	}
	,get_y: function() {
		return this._y;
	}
	,__class__: luxe_tween_MotionPath
	,__properties__: {get_y:"get_y",get_x:"get_x",get_rotation:"get_rotation"}
};
var luxe_tween_IComponentPath = function() { };
$hxClasses["luxe.tween.IComponentPath"] = luxe_tween_IComponentPath;
luxe_tween_IComponentPath.__name__ = ["luxe","tween","IComponentPath"];
luxe_tween_IComponentPath.prototype = {
	__class__: luxe_tween_IComponentPath
	,__properties__: {get_end:"get_end"}
};
var luxe_tween_ComponentPath = function() {
	this.paths = [];
	this.start = 0;
	this.totalStrength = 0;
};
$hxClasses["luxe.tween.ComponentPath"] = luxe_tween_ComponentPath;
luxe_tween_ComponentPath.__name__ = ["luxe","tween","ComponentPath"];
luxe_tween_ComponentPath.__interfaces__ = [luxe_tween_IComponentPath];
luxe_tween_ComponentPath.prototype = {
	addPath: function(path) {
		this.paths.push(path);
		this.totalStrength += path.strength;
	}
	,calculate: function(k) {
		if(this.paths.length == 1) return this.paths[0].calculate(this.start,k); else {
			var ratio = k * this.totalStrength;
			var lastEnd = this.start;
			var _g = 0;
			var _g1 = this.paths;
			while(_g < _g1.length) {
				var path = _g1[_g];
				++_g;
				if(ratio > path.strength) {
					ratio -= path.strength;
					lastEnd = path.end;
				} else return path.calculate(lastEnd,ratio / path.strength);
			}
		}
		return 0;
	}
	,get_end: function() {
		if(this.paths.length > 0) {
			var path = this.paths[this.paths.length - 1];
			return path.end;
		} else return this.start;
	}
	,__class__: luxe_tween_ComponentPath
	,__properties__: {get_end:"get_end"}
};
var luxe_tween_BezierPath = function(end,control,strength) {
	this.end = end;
	this.control = control;
	this.strength = strength;
};
$hxClasses["luxe.tween.BezierPath"] = luxe_tween_BezierPath;
luxe_tween_BezierPath.__name__ = ["luxe","tween","BezierPath"];
luxe_tween_BezierPath.prototype = {
	calculate: function(start,k) {
		return (1 - k) * (1 - k) * start + 2 * (1 - k) * k * this.control + k * k * this.end;
	}
	,__class__: luxe_tween_BezierPath
};
var luxe_tween_LinearPath = function(end,strength) {
	luxe_tween_BezierPath.call(this,end,0,strength);
};
$hxClasses["luxe.tween.LinearPath"] = luxe_tween_LinearPath;
luxe_tween_LinearPath.__name__ = ["luxe","tween","LinearPath"];
luxe_tween_LinearPath.__super__ = luxe_tween_BezierPath;
luxe_tween_LinearPath.prototype = $extend(luxe_tween_BezierPath.prototype,{
	calculate: function(start,k) {
		return start + k * (this.end - start);
	}
	,__class__: luxe_tween_LinearPath
});
var luxe_tween_RotationPath = function(x,y) {
	this.step = 0.01;
	this._x = x;
	this._y = y;
	this.offset = 0;
	this.start = this.calculate(0.0);
};
$hxClasses["luxe.tween.RotationPath"] = luxe_tween_RotationPath;
luxe_tween_RotationPath.__name__ = ["luxe","tween","RotationPath"];
luxe_tween_RotationPath.__interfaces__ = [luxe_tween_IComponentPath];
luxe_tween_RotationPath.prototype = {
	calculate: function(k) {
		var dX = this._x.calculate(k) - this._x.calculate(k + this.step);
		var dY = this._y.calculate(k) - this._y.calculate(k + this.step);
		var angle = Math.atan2(dY,dX) * (180 / Math.PI);
		angle = (angle + this.offset) % 360;
		return angle;
	}
	,get_end: function() {
		return this.calculate(1.0);
	}
	,__class__: luxe_tween_RotationPath
	,__properties__: {get_end:"get_end"}
};
var luxe_tween_actuators_MethodActuator = function(target,duration,properties) {
	this.currentParameters = [];
	this.tweenProperties = { };
	luxe_tween_actuators_SimpleActuator.call(this,target,duration,properties);
	if(!Object.prototype.hasOwnProperty.call(properties,"start")) this.properties.start = [];
	if(!Object.prototype.hasOwnProperty.call(properties,"end")) this.properties.end = this.properties.start;
	var _g1 = 0;
	var _g = this.properties.start.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.currentParameters.push(null);
	}
};
$hxClasses["luxe.tween.actuators.MethodActuator"] = luxe_tween_actuators_MethodActuator;
luxe_tween_actuators_MethodActuator.__name__ = ["luxe","tween","actuators","MethodActuator"];
luxe_tween_actuators_MethodActuator.__super__ = luxe_tween_actuators_SimpleActuator;
luxe_tween_actuators_MethodActuator.prototype = $extend(luxe_tween_actuators_SimpleActuator.prototype,{
	apply: function() {
		this.callMethod(this.target,this.properties.end);
	}
	,complete: function(sendEvent) {
		if(sendEvent == null) sendEvent = true;
		var _g1 = 0;
		var _g = this.properties.start.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.currentParameters[i] = Reflect.field(this.tweenProperties,"param" + i);
		}
		this.callMethod(this.target,this.currentParameters);
		luxe_tween_actuators_SimpleActuator.prototype.complete.call(this,sendEvent);
	}
	,initialize: function() {
		var details;
		var propertyName;
		var start;
		var _g1 = 0;
		var _g = this.properties.start.length;
		while(_g1 < _g) {
			var i = _g1++;
			propertyName = "param" + i;
			start = this.properties.start[i];
			this.tweenProperties[propertyName] = start;
			if(typeof(start) == "number" || ((start | 0) === start)) {
				details = new luxe_tween_actuators_PropertyDetails(this.tweenProperties,propertyName,start,this.properties.end[i] - start);
				this.propertyDetails.push(details);
			}
		}
		this.detailsLength = this.propertyDetails.length;
		this.initialized = true;
	}
	,update: function(currentTime) {
		luxe_tween_actuators_SimpleActuator.prototype.update.call(this,currentTime);
		if(this.active) {
			var _g1 = 0;
			var _g = this.properties.start.length;
			while(_g1 < _g) {
				var i = _g1++;
				this.currentParameters[i] = Reflect.field(this.tweenProperties,"param" + i);
			}
			this.callMethod(this.target,this.currentParameters);
		}
	}
	,__class__: luxe_tween_actuators_MethodActuator
});
var luxe_tween_actuators_MotionPathActuator = function(target,duration,properties) {
	luxe_tween_actuators_SimpleActuator.call(this,target,duration,properties);
};
$hxClasses["luxe.tween.actuators.MotionPathActuator"] = luxe_tween_actuators_MotionPathActuator;
luxe_tween_actuators_MotionPathActuator.__name__ = ["luxe","tween","actuators","MotionPathActuator"];
luxe_tween_actuators_MotionPathActuator.__super__ = luxe_tween_actuators_SimpleActuator;
luxe_tween_actuators_MotionPathActuator.prototype = $extend(luxe_tween_actuators_SimpleActuator.prototype,{
	apply: function() {
		var _g = 0;
		var _g1 = Reflect.fields(this.properties);
		while(_g < _g1.length) {
			var propertyName = _g1[_g];
			++_g;
			if(Object.prototype.hasOwnProperty.call(this.target,propertyName)) Reflect.setField(this.target,propertyName,(js_Boot.__cast(Reflect.field(this.properties,propertyName) , luxe_tween_IComponentPath)).get_end()); else Reflect.setProperty(this.target,propertyName,(js_Boot.__cast(Reflect.field(this.properties,propertyName) , luxe_tween_IComponentPath)).get_end());
		}
	}
	,initialize: function() {
		var details;
		var path;
		var _g = 0;
		var _g1 = Reflect.fields(this.properties);
		while(_g < _g1.length) {
			var propertyName = _g1[_g];
			++_g;
			path = js_Boot.__cast(Reflect.field(this.properties,propertyName) , luxe_tween_IComponentPath);
			if(path != null) {
				var isField = true;
				if(Object.prototype.hasOwnProperty.call(this.target,propertyName)) path.start = Reflect.field(this.target,propertyName); else {
					isField = false;
					path.start = Reflect.getProperty(this.target,propertyName);
				}
				details = new luxe_tween_actuators_PropertyPathDetails(this.target,propertyName,path,isField);
				this.propertyDetails.push(details);
			}
		}
		this.detailsLength = this.propertyDetails.length;
		this.initialized = true;
	}
	,update: function(currentTime) {
		if(!this.paused) {
			var details;
			var easing;
			var tweenPosition = (currentTime - this.timeOffset) / this.duration;
			if(tweenPosition > 1) tweenPosition = 1;
			if(!this.initialized) this.initialize();
			if(!this.special) {
				easing = this._ease.calculate(tweenPosition);
				var _g = 0;
				var _g1 = this.propertyDetails;
				while(_g < _g1.length) {
					var details1 = _g1[_g];
					++_g;
					if(details1.isField) Reflect.setField(details1.target,details1.propertyName,(js_Boot.__cast(details1 , luxe_tween_actuators_PropertyPathDetails)).path.calculate(easing)); else Reflect.setProperty(details1.target,details1.propertyName,(js_Boot.__cast(details1 , luxe_tween_actuators_PropertyPathDetails)).path.calculate(easing));
				}
			} else {
				if(!this._reverse) easing = this._ease.calculate(tweenPosition); else easing = this._ease.calculate(1 - tweenPosition);
				var endValue;
				var _g2 = 0;
				var _g11 = this.propertyDetails;
				while(_g2 < _g11.length) {
					var details2 = _g11[_g2];
					++_g2;
					if(!this._snapping) {
						if(details2.isField) Reflect.setField(details2.target,details2.propertyName,(js_Boot.__cast(details2 , luxe_tween_actuators_PropertyPathDetails)).path.calculate(easing)); else Reflect.setProperty(details2.target,details2.propertyName,(js_Boot.__cast(details2 , luxe_tween_actuators_PropertyPathDetails)).path.calculate(easing));
					} else if(details2.isField) Reflect.setField(details2.target,details2.propertyName,Math.round((js_Boot.__cast(details2 , luxe_tween_actuators_PropertyPathDetails)).path.calculate(easing))); else Reflect.setProperty(details2.target,details2.propertyName,Math.round((js_Boot.__cast(details2 , luxe_tween_actuators_PropertyPathDetails)).path.calculate(easing)));
				}
			}
			if(tweenPosition == 1) {
				if(this._repeat == 0) {
					this.active = false;
					if(this.toggleVisible && this.getField(this.target,"alpha") == 0) this.setField(this.target,"visible",false);
					this.complete(true);
					return;
				} else {
					if(this._reflect) this._reverse = !this._reverse;
					this.startTime = currentTime;
					this.timeOffset = this.startTime + this._delay;
					if(this._repeat > 0) this._repeat--;
				}
			}
			if(this.sendChange) this.change();
		}
	}
	,__class__: luxe_tween_actuators_MotionPathActuator
});
var luxe_tween_actuators_PropertyDetails = function(target,propertyName,start,change,isField) {
	if(isField == null) isField = true;
	this.target = target;
	this.propertyName = propertyName;
	this.start = start;
	this.change = change;
	this.isField = isField;
};
$hxClasses["luxe.tween.actuators.PropertyDetails"] = luxe_tween_actuators_PropertyDetails;
luxe_tween_actuators_PropertyDetails.__name__ = ["luxe","tween","actuators","PropertyDetails"];
luxe_tween_actuators_PropertyDetails.prototype = {
	__class__: luxe_tween_actuators_PropertyDetails
};
var luxe_tween_actuators_PropertyPathDetails = function(target,propertyName,path,isField) {
	if(isField == null) isField = true;
	luxe_tween_actuators_PropertyDetails.call(this,target,propertyName,0,0,isField);
	this.path = path;
};
$hxClasses["luxe.tween.actuators.PropertyPathDetails"] = luxe_tween_actuators_PropertyPathDetails;
luxe_tween_actuators_PropertyPathDetails.__name__ = ["luxe","tween","actuators","PropertyPathDetails"];
luxe_tween_actuators_PropertyPathDetails.__super__ = luxe_tween_actuators_PropertyDetails;
luxe_tween_actuators_PropertyPathDetails.prototype = $extend(luxe_tween_actuators_PropertyDetails.prototype,{
	__class__: luxe_tween_actuators_PropertyPathDetails
});
var luxe_tween_easing_Back = function() { };
$hxClasses["luxe.tween.easing.Back"] = luxe_tween_easing_Back;
luxe_tween_easing_Back.__name__ = ["luxe","tween","easing","Back"];
luxe_tween_easing_Back.__properties__ = {get_easeOut:"get_easeOut",get_easeInOut:"get_easeInOut",get_easeIn:"get_easeIn"}
luxe_tween_easing_Back.get_easeIn = function() {
	return new luxe_tween_easing_BackEaseIn(1.70158);
};
luxe_tween_easing_Back.get_easeInOut = function() {
	return new luxe_tween_easing_BackEaseInOut(1.70158);
};
luxe_tween_easing_Back.get_easeOut = function() {
	return new luxe_tween_easing_BackEaseOut(1.70158);
};
var luxe_tween_easing_BackEaseIn = function(s) {
	this.s = s;
};
$hxClasses["luxe.tween.easing.BackEaseIn"] = luxe_tween_easing_BackEaseIn;
luxe_tween_easing_BackEaseIn.__name__ = ["luxe","tween","easing","BackEaseIn"];
luxe_tween_easing_BackEaseIn.__interfaces__ = [luxe_tween_easing_IEasing];
luxe_tween_easing_BackEaseIn.prototype = {
	calculate: function(k) {
		return k * k * ((this.s + 1) * k - this.s);
	}
	,ease: function(t,b,c,d) {
		return c * (t /= d) * t * ((this.s + 1) * t - this.s) + b;
	}
	,__class__: luxe_tween_easing_BackEaseIn
};
var luxe_tween_easing_BackEaseInOut = function(s) {
	this.s = s;
};
$hxClasses["luxe.tween.easing.BackEaseInOut"] = luxe_tween_easing_BackEaseInOut;
luxe_tween_easing_BackEaseInOut.__name__ = ["luxe","tween","easing","BackEaseInOut"];
luxe_tween_easing_BackEaseInOut.__interfaces__ = [luxe_tween_easing_IEasing];
luxe_tween_easing_BackEaseInOut.prototype = {
	calculate: function(k) {
		if((k /= 0.5) < 1) return 0.5 * (k * k * (((this.s *= 1.525) + 1) * k - this.s));
		return 0.5 * ((k -= 2) * k * (((this.s *= 1.525) + 1) * k + this.s) + 2);
	}
	,ease: function(t,b,c,d) {
		if((t /= d / 2) < 1) return c / 2 * (t * t * (((this.s *= 1.525) + 1) * t - this.s)) + b;
		return c / 2 * ((t -= 2) * t * (((this.s *= 1.525) + 1) * t + this.s) + 2) + b;
	}
	,__class__: luxe_tween_easing_BackEaseInOut
};
var luxe_tween_easing_BackEaseOut = function(s) {
	this.s = s;
};
$hxClasses["luxe.tween.easing.BackEaseOut"] = luxe_tween_easing_BackEaseOut;
luxe_tween_easing_BackEaseOut.__name__ = ["luxe","tween","easing","BackEaseOut"];
luxe_tween_easing_BackEaseOut.__interfaces__ = [luxe_tween_easing_IEasing];
luxe_tween_easing_BackEaseOut.prototype = {
	calculate: function(k) {
		return (k = k - 1) * k * ((this.s + 1) * k + this.s) + 1;
	}
	,ease: function(t,b,c,d) {
		return c * ((t = t / d - 1) * t * ((this.s + 1) * t + this.s) + 1) + b;
	}
	,__class__: luxe_tween_easing_BackEaseOut
};
var luxe_tween_easing_Linear = function() { };
$hxClasses["luxe.tween.easing.Linear"] = luxe_tween_easing_Linear;
luxe_tween_easing_Linear.__name__ = ["luxe","tween","easing","Linear"];
luxe_tween_easing_Linear.__properties__ = {get_easeNone:"get_easeNone"}
luxe_tween_easing_Linear.get_easeNone = function() {
	return new luxe_tween_easing_LinearEaseNone();
};
var luxe_tween_easing_LinearEaseNone = function() {
};
$hxClasses["luxe.tween.easing.LinearEaseNone"] = luxe_tween_easing_LinearEaseNone;
luxe_tween_easing_LinearEaseNone.__name__ = ["luxe","tween","easing","LinearEaseNone"];
luxe_tween_easing_LinearEaseNone.__interfaces__ = [luxe_tween_easing_IEasing];
luxe_tween_easing_LinearEaseNone.prototype = {
	calculate: function(k) {
		return k;
	}
	,ease: function(t,b,c,d) {
		return c * t / d + b;
	}
	,__class__: luxe_tween_easing_LinearEaseNone
};
var luxe_tween_easing_QuadEaseIn = function() {
};
$hxClasses["luxe.tween.easing.QuadEaseIn"] = luxe_tween_easing_QuadEaseIn;
luxe_tween_easing_QuadEaseIn.__name__ = ["luxe","tween","easing","QuadEaseIn"];
luxe_tween_easing_QuadEaseIn.__interfaces__ = [luxe_tween_easing_IEasing];
luxe_tween_easing_QuadEaseIn.prototype = {
	calculate: function(k) {
		return k * k;
	}
	,ease: function(t,b,c,d) {
		return c * (t /= d) * t + b;
	}
	,__class__: luxe_tween_easing_QuadEaseIn
};
var luxe_tween_easing_QuadEaseInOut = function() {
};
$hxClasses["luxe.tween.easing.QuadEaseInOut"] = luxe_tween_easing_QuadEaseInOut;
luxe_tween_easing_QuadEaseInOut.__name__ = ["luxe","tween","easing","QuadEaseInOut"];
luxe_tween_easing_QuadEaseInOut.__interfaces__ = [luxe_tween_easing_IEasing];
luxe_tween_easing_QuadEaseInOut.prototype = {
	calculate: function(k) {
		if((k *= 2) < 1) return 0.5 * k * k;
		return -0.5 * ((k - 1) * (k - 3) - 1);
	}
	,ease: function(t,b,c,d) {
		if((t /= d / 2) < 1) return c / 2 * t * t + b;
		return -c / 2 * ((t - 1) * (t - 3) - 1) + b;
	}
	,__class__: luxe_tween_easing_QuadEaseInOut
};
var luxe_utils_GeometryUtils = function() {
	this._v_cache = new phoenix_Vector();
};
$hxClasses["luxe.utils.GeometryUtils"] = luxe_utils_GeometryUtils;
luxe_utils_GeometryUtils.__name__ = ["luxe","utils","GeometryUtils"];
luxe_utils_GeometryUtils.prototype = {
	segments_for_smooth_circle: function(_radius,_smooth) {
		if(_smooth == null) _smooth = 5;
		return Std["int"](_smooth * Math.sqrt(_radius));
	}
	,random_point_in_unit_circle: function() {
		var _r = Math.sqrt(Math.random());
		var _t = (-1 + 2 * Math.random()) * 6.283185307179586;
		return new phoenix_Vector(_r * Math.cos(_t),_r * Math.sin(_t));
	}
	,point_in_polygon: function(_point,_offset,_verts) {
		if(_offset == null) _offset = new phoenix_Vector();
		_offset;
		var c = false;
		var nvert = _verts.length;
		var j = nvert - 1;
		var _g = 0;
		while(_g < nvert) {
			var i = _g++;
			if(_verts[i].y + _offset.y > _point.y != _verts[j].y + _offset.y > _point.y && _point.x < (_verts[j].x + _offset.x - (_verts[i].x + _offset.x)) * (_point.y - (_verts[i].y + _offset.y)) / (_verts[j].y + _offset.y - (_verts[i].y + _offset.y)) + (_verts[i].x + _offset.x)) c = !c;
			j = i;
		}
		return c;
	}
	,point_in_geometry: function(_point,_geometry) {
		var c = false;
		var nvert = _geometry.vertices.length;
		var j = nvert - 1;
		var _px = _point.x;
		var _py = _point.y;
		var _g = 0;
		while(_g < nvert) {
			var i = _g++;
			var _vert_i = _geometry.vertices[i].pos;
			var _vert_j = _geometry.vertices[j].pos;
			this._v_cache.set_xy(_vert_i.x,_vert_i.y);
			this._v_cache.transform(_geometry.transform.get_world().get_matrix());
			var _vert_i_x = this._v_cache.x;
			var _vert_i_y = this._v_cache.y;
			this._v_cache.set_xy(_vert_j.x,_vert_j.y);
			this._v_cache.transform(_geometry.transform.get_world().get_matrix());
			var _vert_j_x = this._v_cache.x;
			var _vert_j_y = this._v_cache.y;
			if(_vert_i_y > _point.y != _vert_j_y > _point.y && _point.x < (_vert_j_x - _vert_i_x) * (_point.y - _vert_i_y) / (_vert_j_y - _vert_i_y) + _vert_i_x) c = !c;
			j = i;
		}
		return c;
	}
	,intersect_ray_plane: function(_ray_start,_ray_dir,_plane_normal,_plane_point) {
		var part1 = _plane_normal.dot(new phoenix_Vector(_plane_point.x - _ray_start.x,_plane_point.y - _ray_start.y,_plane_point.z - _ray_start.z));
		var part2 = _plane_normal.x * _ray_dir.x + _plane_normal.y * _ray_dir.y + _plane_normal.z * _ray_dir.z;
		var T = part1 / part2;
		return phoenix_Vector.Add(_ray_start,phoenix_Vector.Multiply(_ray_dir,T));
	}
	,__class__: luxe_utils_GeometryUtils
};
var luxe_utils_Maths = function() {
};
$hxClasses["luxe.utils.Maths"] = luxe_utils_Maths;
luxe_utils_Maths.__name__ = ["luxe","utils","Maths"];
luxe_utils_Maths.fixed = function(value,precision) {
	var n = Math.pow(10,precision);
	return (value * n | 0) / n;
};
luxe_utils_Maths.lerp = function(value,target,t) {
	if(t < 0) t = 0; else if(t > 1) t = 1; else t = t;
	return value + t * (target - value);
};
luxe_utils_Maths.weighted_avg = function(value,target,slowness) {
	if(slowness == 0) slowness = 0.00000001;
	return (value * (slowness - 1) + target) / slowness;
};
luxe_utils_Maths.clamp = function(value,a,b) {
	if(value < a) return a; else if(value > b) return b; else return value;
};
luxe_utils_Maths.clampi = function(value,a,b) {
	if(value < a) return a; else if(value > b) return b; else return value;
};
luxe_utils_Maths.clamp_bottom = function(value,a) {
	if(value < a) return a; else return value;
};
luxe_utils_Maths.within_range = function(value,start_range,end_range) {
	return value >= start_range && value <= end_range;
};
luxe_utils_Maths.wrap_angle = function(degrees,lower,upper) {
	var _radians = degrees * 0.017453292519943278;
	var _distance = upper - lower;
	var _times = Math.floor((degrees - lower) / _distance);
	return degrees - _times * _distance;
};
luxe_utils_Maths.nearest_power_of_two = function(_value) {
	_value--;
	_value |= _value >> 1;
	_value |= _value >> 2;
	_value |= _value >> 4;
	_value |= _value >> 8;
	_value |= _value >> 16;
	_value++;
	return _value;
};
luxe_utils_Maths.map_linear = function(value,a1,a2,b1,b2) {
	return b1 + (value - a1) * (b2 - b1) / (a2 - a1);
};
luxe_utils_Maths.smoothstep = function(x,min,max) {
	if(x <= min) return 0;
	if(x >= max) return 1;
	x = (x - min) / (max - min);
	return x * x * (3 - 2 * x);
};
luxe_utils_Maths.smootherstep = function(x,min,max) {
	if(x <= min) return 0;
	if(x >= max) return 1;
	x = (x - min) / (max - min);
	return x * x * x * (x * (x * 6 - 15) + 10);
};
luxe_utils_Maths.sign = function(x) {
	if(x >= 0) return 1; else return -1;
};
luxe_utils_Maths.sign0 = function(x) {
	if(x < 0) return -1; else if(x > 0) return 1; else return 0;
};
luxe_utils_Maths.radians = function(degrees) {
	return degrees * 0.017453292519943278;
};
luxe_utils_Maths.degrees = function(radians) {
	return radians * 57.29577951308238;
};
luxe_utils_Maths.prototype = {
	__class__: luxe_utils_Maths
};
var luxe_utils_Random = function(_initial_seed) {
	if(!(_initial_seed > 0)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_initial_seed > 0" + (" ( " + "initial negative seed will return negative random results, if this was intentional, define luxe_random_allow_negative_seed" + " )")));
	this.initial = this.seed = _initial_seed;
	this.seed = this.initial;
};
$hxClasses["luxe.utils.Random"] = luxe_utils_Random;
luxe_utils_Random.__name__ = ["luxe","utils","Random"];
luxe_utils_Random.prototype = {
	get: function() {
		return (this.seed = this.seed * 16807 % 2147483647) / 2147483647 + 0.000000000233;
	}
	,'float': function(min,max) {
		if(max == null) {
			max = min;
			min = 0;
		}
		return ((this.seed = this.seed * 16807 % 2147483647) / 2147483647 + 0.000000000233) * (max - min) + min;
	}
	,'int': function(min,max) {
		if(max == null) {
			max = min;
			min = 0;
		}
		return Math.floor(this["float"](min,max));
	}
	,bool: function(chance) {
		if(chance == null) chance = 0.5;
		return (this.seed = this.seed * 16807 % 2147483647) / 2147483647 + 0.000000000233 < chance;
	}
	,sign: function(chance) {
		if(chance == null) chance = 0.5;
		if((this.seed = this.seed * 16807 % 2147483647) / 2147483647 + 0.000000000233 < chance) return 1; else return -1;
	}
	,bit: function(chance) {
		if(chance == null) chance = 0.5;
		if((this.seed = this.seed * 16807 % 2147483647) / 2147483647 + 0.000000000233 < chance) return 1; else return 0;
	}
	,reset: function() {
		var s = this.seed;
		this.initial = this.seed = s;
		this.initial;
	}
	,set_initial: function(_initial) {
		this.initial = this.seed = _initial;
		return this.initial;
	}
	,__class__: luxe_utils_Random
	,__properties__: {set_initial:"set_initial"}
};
var luxe_utils_Utils = function(_luxe) {
	this.core = _luxe;
	this.geometry = new luxe_utils_GeometryUtils();
	this.random = new luxe_utils_Random(Math.random() * 16777215);
	this._byte_levels = ["bytes","Kb","MB","GB","TB"];
};
$hxClasses["luxe.utils.Utils"] = luxe_utils_Utils;
luxe_utils_Utils.__name__ = ["luxe","utils","Utils"];
luxe_utils_Utils.prototype = {
	pos_info: function(pos) {
		return "" + pos.fileName + ":" + pos.lineNumber + ":(" + pos.className + ":" + pos.methodName + ")";
	}
	,uniqueid: function(val) {
		if(val == null) val = Std.random(2147483647);
		var to_char = function(value) {
			if(value > 9) {
				var ascii = 65 + (value - 10);
				if(ascii > 90) ascii += 6;
				return String.fromCharCode(ascii);
			} else return (value == null?"null":"" + value).charAt(0);
		};
		var r = val % 62 | 0;
		var q = val / 62 | 0;
		if(q > 0) return this.uniqueid(q) + to_char(r); else return Std.string(to_char(r));
	}
	,uniquehash: function() {
		return this.hash(this.uniqueid());
	}
	,hash: function(string) {
		return this.hashdjb2(string);
	}
	,hashdjb2: function(string) {
		var _hash = 5381;
		var _g1 = 0;
		var _g = string.length;
		while(_g1 < _g) {
			var i = _g1++;
			_hash = (_hash << 5) + _hash + HxOverrides.cca(string,i);
		}
		return _hash;
	}
	,uniqueid2: function() {
		return haxe_crypto_Md5.encode(Std.string((window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start) * Math.random()));
	}
	,stacktrace: function(_depth) {
		if(_depth == null) _depth = 100;
		var result = "\n";
		var stack = haxe_CallStack.callStack();
		stack.shift();
		stack.reverse();
		var total = Std["int"](Math.min(stack.length,_depth));
		var _g = 0;
		while(_g < total) {
			var i = _g++;
			var stackitem = stack[i];
			{
				var _g1 = stack[i];
				switch(_g1[1]) {
				case 2:
					var line = _g1[4];
					var file = _g1[3];
					var s = _g1[2];
					if(s != null) switch(s[1]) {
					case 3:
						var method = s[3];
						var classname = s[2];
						result += "   at " + file + ":" + line + ": " + classname + "." + method;
						break;
					default:
					} else {
					}
					break;
				default:
				}
			}
			if(i != total - 1) result += "\n";
		}
		return result;
	}
	,path_is_relative: function(_path) {
		return _path.charAt(0) != "#" && _path.charAt(0) != "/" && _path.indexOf(":\\") == -1 && _path.indexOf(":/") == -1 && (_path.indexOf("//") == -1 || _path.indexOf("//") > _path.indexOf("#") || _path.indexOf("//") > _path.indexOf("?"));
	}
	,find_assets_sequence: function(_name,_ext,_start) {
		if(_start == null) _start = "1";
		if(_ext == null) _ext = ".png";
		var _final = [];
		var _sequence_type = "";
		var _pattern_regex = null;
		var _type0 = _name + _start + _ext;
		var _type0_re = new EReg("(" + _name + ")(\\d\\b)","gi");
		var _type1 = _name + "_" + _start + _ext;
		var _type1_re = new EReg("(" + _name + ")(_\\d\\b)","gi");
		var _type2 = _name + "-" + _start + _ext;
		var _type2_re = new EReg("(" + _name + ")(-\\d\\b)","gi");
		if(Luxe.resources.cache.exists(_type0)) {
			_sequence_type = _type0;
			_pattern_regex = _type0_re;
		} else if(Luxe.resources.cache.exists(_type1)) {
			_sequence_type = _type1;
			_pattern_regex = _type1_re;
		} else if(Luxe.resources.cache.exists(_type2)) {
			_sequence_type = _type2;
			_pattern_regex = _type2_re;
		} else haxe_Log.trace("Sequence requested from " + _name + " but no assets found like `" + _type0 + "` or `" + _type1 + "` or `" + _type2 + "`",{ fileName : "Utils.hx", lineNumber : 170, className : "luxe.utils.Utils", methodName : "find_assets_sequence"});
		if(_sequence_type != "") {
			var $it0 = this.core.resources.cache.iterator();
			while( $it0.hasNext() ) {
				var _asset = $it0.next();
				if(_pattern_regex.match(_asset.id)) _final.push(_asset.id);
			}
			_final.sort(function(a,b) {
				if(a == b) return 0;
				if(a < b) return -1;
				return 1;
			});
		}
		return _final;
	}
	,text_wrap_column_knuth_plass: function(_string,_column) {
		if(_column == null) _column = 80;
		var result = [];
		var words = [];
		var lengths = [];
		var badness;
		var _g = new haxe_ds_IntMap();
		_g.h[0] = 0;
		badness = _g;
		var extra = new haxe_ds_IntMap();
		var s = _string;
		var rgx = new EReg("(\\b[^\\s]+\\b)","gm");
		while(rgx.match(s)) {
			words.push(rgx.matched(1));
			s = rgx.matchedRight();
		}
		if(words.length == 0) words.push(_string);
		words;
		words.map(function(w) {
			lengths.push(w.length);
		});
		var n = words.length;
		var _g2 = 1;
		var _g1 = n + 1;
		while(_g2 < _g1) {
			var i = _g2++;
			var sums = new haxe_ds_IntMap();
			var k = i;
			while((function($this) {
				var $r;
				var total = 0;
				{
					var _g3 = k - 1;
					while(_g3 < i) {
						var i1 = _g3++;
						total += lengths[i1];
					}
				}
				$r = total + (i - k + 1);
				return $r;
			}(this)) <= _column && k > 0) {
				var a;
				a = _column - (function($this) {
					var $r;
					var total1 = 0;
					{
						var _g4 = k - 1;
						while(_g4 < i) {
							var i2 = _g4++;
							total1 += lengths[i2];
						}
					}
					$r = total1 + (i - k + 1);
					return $r;
				}(this));
				var k1 = Std["int"](Math.pow(a,3) + badness.h[k - 1]);
				sums.h[k1] = k;
				k;
				k -= 1;
			}
			var mn;
			var min = 1073741823;
			var $it0 = sums.keys();
			while( $it0.hasNext() ) {
				var item = $it0.next();
				if(item < min) min = item;
			}
			mn = min;
			{
				badness.h[i] = mn;
				mn;
			}
			var v = sums.h[mn];
			extra.h[i] = v;
			v;
		}
		var line = 1;
		while(n > 1) {
			result.unshift(words.slice(extra.h[n] - 1,n).join(" "));
			n = extra.h[n] - 1;
			line += 1;
		}
		if(result.length == 0) result.push(_string);
		return result;
	}
	,text_wrap_column: function(_text,_brk,_column) {
		if(_column == null) _column = 80;
		if(_brk == null) _brk = "\n";
		var result = new EReg("(.{1," + _column + "})(?: +|$)\n?|(.{" + _column + "})","gimu").replace(_text,"$1$2" + _brk);
		return StringTools.rtrim(result);
	}
	,bytes_to_string: function(bytes,precision) {
		if(precision == null) precision = 3;
		var index;
		if(bytes == 0) index = 0; else index = Math.floor(Math.log(bytes) / Math.log(1024));
		var _byte_value = bytes / Math.pow(1024,index);
		_byte_value = luxe_utils_Maths.fixed(_byte_value,precision);
		return _byte_value + " " + this._byte_levels[index];
	}
	,array_to_bytes: function(array) {
		if(array == null) return null;
		var bytes = haxe_io_Bytes.alloc(array.length);
		var _g1 = 0;
		var _g = bytes.length;
		while(_g1 < _g) {
			var n = _g1++;
			bytes.b[n] = array[n] & 255;
		}
		return bytes;
	}
	,premultiply_alpha: function(_pixels) {
		var count = _pixels.length;
		var read = _pixels[0];
		var index = 0;
		while(index < count) {
			var r = _pixels[index];
			var g = _pixels[index + 1];
			var b = _pixels[index + 2];
			var a = _$UInt_UInt_$Impl_$.toFloat(_pixels[index + 3]) / 255.0;
			var val = Std["int"](_$UInt_UInt_$Impl_$.toFloat(r) * a);
			_pixels[index] = val;
			var val1 = Std["int"](_$UInt_UInt_$Impl_$.toFloat(g) * a);
			_pixels[index + 1] = val1;
			var val2 = Std["int"](_$UInt_UInt_$Impl_$.toFloat(b) * a);
			_pixels[index + 2] = val2;
			index += 4;
		}
		return _pixels;
	}
	,premultiply_alpha_normalized: function(_pixels) {
		var count = _pixels.length;
		var read = _pixels[0];
		var index = 0;
		while(index < count) {
			var r = _pixels[index];
			var g = _pixels[index + 1];
			var b = _pixels[index + 2];
			var a = _pixels[index + 3];
			_pixels[index] = r * a;
			_pixels[index + 1] = g * a;
			_pixels[index + 2] = b * a;
			index += 4;
		}
		return _pixels;
	}
	,__class__: luxe_utils_Utils
};
var luxe_utils_unifill__$CodePoint_CodePoint_$Impl_$ = {};
$hxClasses["luxe.utils.unifill._CodePoint.CodePoint_Impl_"] = luxe_utils_unifill__$CodePoint_CodePoint_$Impl_$;
luxe_utils_unifill__$CodePoint_CodePoint_$Impl_$.__name__ = ["luxe","utils","unifill","_CodePoint","CodePoint_Impl_"];
luxe_utils_unifill__$CodePoint_CodePoint_$Impl_$.cons = function(a,b) {
	return luxe_utils_unifill_InternalEncoding.fromCodePoint(a) + b;
};
luxe_utils_unifill__$CodePoint_CodePoint_$Impl_$.snoc = function(a,b) {
	return a + luxe_utils_unifill_InternalEncoding.fromCodePoint(b);
};
luxe_utils_unifill__$CodePoint_CodePoint_$Impl_$.addInt = function(a,b) {
	return a + b;
};
luxe_utils_unifill__$CodePoint_CodePoint_$Impl_$.sub = function(a,b) {
	return a - b;
};
luxe_utils_unifill__$CodePoint_CodePoint_$Impl_$.subInt = function(a,b) {
	return a - b;
};
luxe_utils_unifill__$CodePoint_CodePoint_$Impl_$._new = function(code) {
	var this1;
	if(!(0 <= code && code <= 1114111 && !(55296 <= code && code <= 56319) && !(56320 <= code && code <= 57343))) throw new js__$Boot_HaxeError(luxe_utils_unifill_Exception.InvalidCodePoint(code));
	this1 = code;
	return this1;
};
luxe_utils_unifill__$CodePoint_CodePoint_$Impl_$.toString = function(this1) {
	return luxe_utils_unifill_InternalEncoding.fromCodePoint(this1);
};
luxe_utils_unifill__$CodePoint_CodePoint_$Impl_$.toInt = function(this1) {
	return this1;
};
var luxe_utils_unifill_CodePointIter = function(s) {
	this.i = 0;
	this.string = s;
	this.index = 0;
	this.endIndex = s.length;
};
$hxClasses["luxe.utils.unifill.CodePointIter"] = luxe_utils_unifill_CodePointIter;
luxe_utils_unifill_CodePointIter.__name__ = ["luxe","utils","unifill","CodePointIter"];
luxe_utils_unifill_CodePointIter.prototype = {
	hasNext: function() {
		return this.index < this.endIndex;
	}
	,next: function() {
		this.i = this.index;
		this.index += luxe_utils_unifill_InternalEncoding.codePointWidthAt(this.string,this.index);
		return luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointAt(this.string,this.i);
	}
	,__class__: luxe_utils_unifill_CodePointIter
};
var luxe_utils_unifill_Exception = $hxClasses["luxe.utils.unifill.Exception"] = { __ename__ : ["luxe","utils","unifill","Exception"], __constructs__ : ["InvalidCodePoint","InvalidCodeUnitSequence"] };
luxe_utils_unifill_Exception.InvalidCodePoint = function(code) { var $x = ["InvalidCodePoint",0,code]; $x.__enum__ = luxe_utils_unifill_Exception; $x.toString = $estr; return $x; };
luxe_utils_unifill_Exception.InvalidCodeUnitSequence = function(index) { var $x = ["InvalidCodeUnitSequence",1,index]; $x.__enum__ = luxe_utils_unifill_Exception; $x.toString = $estr; return $x; };
var luxe_utils_unifill_InternalEncoding = function() { };
$hxClasses["luxe.utils.unifill.InternalEncoding"] = luxe_utils_unifill_InternalEncoding;
luxe_utils_unifill_InternalEncoding.__name__ = ["luxe","utils","unifill","InternalEncoding"];
luxe_utils_unifill_InternalEncoding.__properties__ = {get_internalEncoding:"get_internalEncoding"}
luxe_utils_unifill_InternalEncoding.get_internalEncoding = function() {
	return "UTF-16";
};
luxe_utils_unifill_InternalEncoding.codeUnitAt = function(s,index) {
	return s.charCodeAt(index);
};
luxe_utils_unifill_InternalEncoding.codePointAt = function(s,index) {
	return luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointAt(s,index);
};
luxe_utils_unifill_InternalEncoding.charAt = function(s,index) {
	var this1;
	var this2 = s;
	var s1;
	var len;
	var c = this2.charCodeAt(index);
	if(!(55296 <= c && c <= 56319)) len = 1; else len = 2;
	var s2 = HxOverrides.substr(this2,index,len);
	s1 = s2;
	this1 = s1;
	return this1;
};
luxe_utils_unifill_InternalEncoding.codePointCount = function(s,beginIndex,endIndex) {
	return luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointCount(s,beginIndex,endIndex);
};
luxe_utils_unifill_InternalEncoding.codePointWidthAt = function(s,index) {
	var c = s.charCodeAt(index);
	if(!(55296 <= c && c <= 56319)) return 1; else return 2;
};
luxe_utils_unifill_InternalEncoding.codePointWidthBefore = function(s,index) {
	var this1 = s;
	return luxe_utils_unifill__$Utf16_Utf16Impl.find_prev_code_point(function(i) {
		return this1.charCodeAt(i);
	},index);
};
luxe_utils_unifill_InternalEncoding.offsetByCodePoints = function(s,index,codePointOffset) {
	var this1 = s;
	if(codePointOffset >= 0) {
		var index1 = index;
		var len = this1.length;
		var i = 0;
		while(i < codePointOffset && index1 < len) {
			var c = this1.charCodeAt(index1);
			if(!(55296 <= c && c <= 56319)) index1 += 1; else index1 += 2;
			++i;
		}
		return index1;
	} else {
		var index2 = index;
		var count = 0;
		while(count < -codePointOffset && 0 < index2) {
			var this2 = [this1];
			index2 -= luxe_utils_unifill__$Utf16_Utf16Impl.find_prev_code_point((function(this2) {
				return function(i1) {
					return this2[0].charCodeAt(i1);
				};
			})(this2),index2);
			++count;
		}
		return index2;
	}
};
luxe_utils_unifill_InternalEncoding.backwardOffsetByCodePoints = function(s,index,codePointOffset) {
	var this1 = s;
	var codePointOffset1 = -codePointOffset;
	if(codePointOffset1 >= 0) {
		var index1 = index;
		var len = this1.length;
		var i = 0;
		while(i < codePointOffset1 && index1 < len) {
			var c = this1.charCodeAt(index1);
			if(!(55296 <= c && c <= 56319)) index1 += 1; else index1 += 2;
			++i;
		}
		return index1;
	} else {
		var index2 = index;
		var count = 0;
		while(count < -codePointOffset1 && 0 < index2) {
			var this2 = [this1];
			index2 -= luxe_utils_unifill__$Utf16_Utf16Impl.find_prev_code_point((function(this2) {
				return function(i1) {
					return this2[0].charCodeAt(i1);
				};
			})(this2),index2);
			++count;
		}
		return index2;
	}
};
luxe_utils_unifill_InternalEncoding.fromCodePoint = function(codePoint) {
	var this1;
	if(codePoint <= 65535) {
		var s;
		var s1 = String.fromCharCode(codePoint);
		s = s1;
		this1 = s;
	} else {
		var s2;
		var s3 = String.fromCharCode((codePoint >> 10) + 55232) + String.fromCharCode(codePoint & 1023 | 56320);
		s2 = s3;
		this1 = s2;
	}
	return this1;
};
luxe_utils_unifill_InternalEncoding.fromCodePoints = function(codePoints) {
	var this1;
	var buf = new StringBuf();
	var $it0 = $iterator(codePoints)();
	while( $it0.hasNext() ) {
		var c = $it0.next();
		luxe_utils_unifill__$Utf16_Utf16Impl.encode_code_point(function(x) {
			buf.b += String.fromCharCode(x);
		},c);
	}
	this1 = buf.b;
	return this1;
};
luxe_utils_unifill_InternalEncoding.validate = function(s) {
	luxe_utils_unifill__$Utf16_Utf16_$Impl_$.validate(s);
};
luxe_utils_unifill_InternalEncoding.isValidString = function(s) {
	try {
		luxe_utils_unifill__$Utf16_Utf16_$Impl_$.validate(s);
		return true;
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		if( js_Boot.__instanceof(e,luxe_utils_unifill_Exception) ) {
			switch(e[1]) {
			case 1:
				var index = e[2];
				return false;
			default:
				throw new js__$Boot_HaxeError(e);
			}
		} else throw(e);
	}
};
var luxe_utils_unifill_InternalEncodingIter = function(s,beginIndex,endIndex) {
	this.i = 0;
	this.string = s;
	this.index = beginIndex;
	this.endIndex = endIndex;
};
$hxClasses["luxe.utils.unifill.InternalEncodingIter"] = luxe_utils_unifill_InternalEncodingIter;
luxe_utils_unifill_InternalEncodingIter.__name__ = ["luxe","utils","unifill","InternalEncodingIter"];
luxe_utils_unifill_InternalEncodingIter.prototype = {
	hasNext: function() {
		return this.index < this.endIndex;
	}
	,next: function() {
		this.i = this.index;
		this.index += luxe_utils_unifill_InternalEncoding.codePointWidthAt(this.string,this.index);
		return this.i;
	}
	,__class__: luxe_utils_unifill_InternalEncodingIter
};
var luxe_utils_unifill_Unicode = function() { };
$hxClasses["luxe.utils.unifill.Unicode"] = luxe_utils_unifill_Unicode;
luxe_utils_unifill_Unicode.__name__ = ["luxe","utils","unifill","Unicode"];
luxe_utils_unifill_Unicode.decodeSurrogate = function(hi,lo) {
	return hi - 55232 << 10 | lo & 1023;
};
luxe_utils_unifill_Unicode.encodeHighSurrogate = function(c) {
	return (c >> 10) + 55232;
};
luxe_utils_unifill_Unicode.encodeLowSurrogate = function(c) {
	return c & 1023 | 56320;
};
luxe_utils_unifill_Unicode.isScalar = function(code) {
	return 0 <= code && code <= 1114111 && !(55296 <= code && code <= 56319) && !(56320 <= code && code <= 57343);
};
luxe_utils_unifill_Unicode.isHighSurrogate = function(code) {
	return 55296 <= code && code <= 56319;
};
luxe_utils_unifill_Unicode.isLowSurrogate = function(code) {
	return 56320 <= code && code <= 57343;
};
var luxe_utils_unifill_Unifill = function() { };
$hxClasses["luxe.utils.unifill.Unifill"] = luxe_utils_unifill_Unifill;
luxe_utils_unifill_Unifill.__name__ = ["luxe","utils","unifill","Unifill"];
luxe_utils_unifill_Unifill.uLength = function(s) {
	return luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointCount(s,0,s.length);
};
luxe_utils_unifill_Unifill.uCharAt = function(s,index) {
	var i = luxe_utils_unifill_InternalEncoding.offsetByCodePoints(s,0,index);
	return luxe_utils_unifill_InternalEncoding.charAt(s,i);
};
luxe_utils_unifill_Unifill.uCharCodeAt = function(s,index) {
	var i = luxe_utils_unifill_InternalEncoding.offsetByCodePoints(s,0,index);
	return luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointAt(s,i);
};
luxe_utils_unifill_Unifill.uCodePointAt = function(s,index) {
	return luxe_utils_unifill_Unifill.uCharCodeAt(s,index);
};
luxe_utils_unifill_Unifill.uIndexOf = function(s,value,startIndex) {
	if(startIndex == null) startIndex = 0;
	var index = s.indexOf(value,luxe_utils_unifill_InternalEncoding.offsetByCodePoints(s,0,startIndex));
	if(index >= 0) return luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointCount(s,0,index); else return -1;
};
luxe_utils_unifill_Unifill.uLastIndexOf = function(s,value,startIndex) {
	if(startIndex == null) startIndex = s.length - 1;
	var index = s.lastIndexOf(value,luxe_utils_unifill_InternalEncoding.offsetByCodePoints(s,0,startIndex));
	if(index >= 0) return luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointCount(s,0,index); else return -1;
};
luxe_utils_unifill_Unifill.uSplit = function(s,delimiter) {
	if(delimiter.length == 0) {
		var _g = [];
		var _g1_i = 0;
		var _g1_string = s;
		var _g1_index = 0;
		var _g1_endIndex = s.length;
		while(_g1_index < _g1_endIndex) {
			var i;
			_g1_i = _g1_index;
			_g1_index += luxe_utils_unifill_InternalEncoding.codePointWidthAt(_g1_string,_g1_index);
			i = _g1_i;
			_g.push(luxe_utils_unifill_InternalEncoding.charAt(s,i));
		}
		return _g;
	} else return s.split(delimiter);
};
luxe_utils_unifill_Unifill.uSubstr = function(s,startIndex,length) {
	var si = luxe_utils_unifill_InternalEncoding.offsetByCodePoints(s,startIndex >= 0?0:s.length,startIndex);
	var ei;
	if(length == null) ei = s.length; else if(length < 0) ei = si; else ei = luxe_utils_unifill_InternalEncoding.offsetByCodePoints(s,si,length);
	return s.substring(si,ei);
};
luxe_utils_unifill_Unifill.uSubstring = function(s,startIndex,endIndex) {
	var si;
	if(startIndex < 0) si = 0; else si = luxe_utils_unifill_InternalEncoding.offsetByCodePoints(s,0,startIndex);
	var ei;
	if(endIndex == null) ei = s.length; else if(endIndex < 0) ei = 0; else ei = luxe_utils_unifill_InternalEncoding.offsetByCodePoints(s,0,endIndex);
	return s.substring(si,ei);
};
luxe_utils_unifill_Unifill.uIterator = function(s) {
	return new luxe_utils_unifill_CodePointIter(s);
};
luxe_utils_unifill_Unifill.uCompare = function(a,b) {
	var aiter_i = 0;
	var aiter_string = a;
	var aiter_index = 0;
	var aiter_endIndex = a.length;
	var biter_i = 0;
	var biter_string = b;
	var biter_index = 0;
	var biter_endIndex = b.length;
	while(aiter_index < aiter_endIndex && biter_index < biter_endIndex) {
		var acode = luxe_utils_unifill_InternalEncoding.codePointAt(a,(function($this) {
			var $r;
			aiter_i = aiter_index;
			aiter_index += luxe_utils_unifill_InternalEncoding.codePointWidthAt(aiter_string,aiter_index);
			$r = aiter_i;
			return $r;
		}(this)));
		var bcode = luxe_utils_unifill_InternalEncoding.codePointAt(b,(function($this) {
			var $r;
			biter_i = biter_index;
			biter_index += luxe_utils_unifill_InternalEncoding.codePointWidthAt(biter_string,biter_index);
			$r = biter_i;
			return $r;
		}(this)));
		if(acode < bcode) return -1;
		if(acode > bcode) return 1;
	}
	if(biter_index < biter_endIndex) return -1;
	if(aiter_index < aiter_endIndex) return 1;
	return 0;
};
luxe_utils_unifill_Unifill.uToString = function(codePoints) {
	return luxe_utils_unifill_InternalEncoding.fromCodePoints(codePoints);
};
var luxe_utils_unifill__$Utf16_Utf16_$Impl_$ = {};
$hxClasses["luxe.utils.unifill._Utf16.Utf16_Impl_"] = luxe_utils_unifill__$Utf16_Utf16_$Impl_$;
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.__name__ = ["luxe","utils","unifill","_Utf16","Utf16_Impl_"];
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.__properties__ = {get_length:"get_length"}
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.fromCodePoint = function(codePoint) {
	if(codePoint <= 65535) {
		var s;
		var s1 = String.fromCharCode(codePoint);
		s = s1;
		return s;
	} else {
		var s2;
		var s3 = String.fromCharCode((codePoint >> 10) + 55232) + String.fromCharCode(codePoint & 1023 | 56320);
		s2 = s3;
		return s2;
	}
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.fromCodePoints = function(codePoints) {
	var buf = new StringBuf();
	var $it0 = $iterator(codePoints)();
	while( $it0.hasNext() ) {
		var c = $it0.next();
		luxe_utils_unifill__$Utf16_Utf16Impl.encode_code_point(function(x) {
			buf.b += String.fromCharCode(x);
		},c);
	}
	return buf.b;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.fromString = function(s) {
	return s;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.fromArray = function(a) {
	var s;
	var buf_b = "";
	var _g = 0;
	while(_g < a.length) {
		var x = a[_g];
		++_g;
		buf_b += String.fromCharCode(x);
	}
	s = buf_b;
	return s;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codeUnitAt = function(this1,index) {
	return this1.charCodeAt(index);
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointAt = function(this1,index) {
	return luxe_utils_unifill__$Utf16_Utf16Impl.decode_code_point(this1.length,function(i) {
		return this1.charCodeAt(i);
	},index);
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.charAt = function(this1,index) {
	var s;
	var len;
	var c = this1.charCodeAt(index);
	if(!(55296 <= c && c <= 56319)) len = 1; else len = 2;
	var s1 = HxOverrides.substr(this1,index,len);
	s = s1;
	return s;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointCount = function(this1,beginIndex,endIndex) {
	var index = beginIndex;
	var i = 0;
	while(index < endIndex) {
		var c = this1.charCodeAt(index);
		if(!(55296 <= c && c <= 56319)) index += 1; else index += 2;
		++i;
	}
	return i;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointWidthAt = function(this1,index) {
	var c = this1.charCodeAt(index);
	if(!(55296 <= c && c <= 56319)) return 1; else return 2;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointWidthBefore = function(this1,index) {
	return luxe_utils_unifill__$Utf16_Utf16Impl.find_prev_code_point(function(i) {
		return this1.charCodeAt(i);
	},index);
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.offsetByCodePoints = function(this1,index,codePointOffset) {
	if(codePointOffset >= 0) {
		var index1 = index;
		var len = this1.length;
		var i = 0;
		while(i < codePointOffset && index1 < len) {
			var c = this1.charCodeAt(index1);
			if(!(55296 <= c && c <= 56319)) index1 += 1; else index1 += 2;
			++i;
		}
		return index1;
	} else {
		var index2 = index;
		var count = 0;
		while(count < -codePointOffset && 0 < index2) {
			var this2 = [this1];
			index2 -= luxe_utils_unifill__$Utf16_Utf16Impl.find_prev_code_point((function(this2) {
				return function(i1) {
					return this2[0].charCodeAt(i1);
				};
			})(this2),index2);
			++count;
		}
		return index2;
	}
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.substr = function(this1,index,len) {
	var s;
	var s1 = HxOverrides.substr(this1,index,len);
	s = s1;
	return s;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.validate = function(this1) {
	var len = this1.length;
	var accessor = function(i) {
		return this1.charCodeAt(i);
	};
	var i1 = 0;
	while(i1 < len) {
		luxe_utils_unifill__$Utf16_Utf16Impl.decode_code_point(len,accessor,i1);
		var c = this1.charCodeAt(i1);
		if(!(55296 <= c && c <= 56319)) i1 += 1; else i1 += 2;
	}
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.toString = function(this1) {
	return this1;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.toArray = function(this1) {
	var i = 0;
	var len = this1.length;
	var _g = [];
	while(i < len) _g.push(StringTools.fastCodeAt(this1,i++));
	return _g;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$._new = function(s) {
	return s;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.get_length = function(this1) {
	return this1.length;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.forward_offset_by_code_points = function(this1,index,codePointOffset) {
	var len = this1.length;
	var i = 0;
	while(i < codePointOffset && index < len) {
		var c = this1.charCodeAt(index);
		if(!(55296 <= c && c <= 56319)) index += 1; else index += 2;
		++i;
	}
	return index;
};
luxe_utils_unifill__$Utf16_Utf16_$Impl_$.backward_offset_by_code_points = function(this1,index,codePointOffset) {
	var count = 0;
	while(count < codePointOffset && 0 < index) {
		var this2 = [this1];
		index -= luxe_utils_unifill__$Utf16_Utf16Impl.find_prev_code_point((function(this2) {
			return function(i) {
				return this2[0].charCodeAt(i);
			};
		})(this2),index);
		++count;
	}
	return index;
};
var luxe_utils_unifill__$Utf16_Utf16Impl = function() { };
$hxClasses["luxe.utils.unifill._Utf16.Utf16Impl"] = luxe_utils_unifill__$Utf16_Utf16Impl;
luxe_utils_unifill__$Utf16_Utf16Impl.__name__ = ["luxe","utils","unifill","_Utf16","Utf16Impl"];
luxe_utils_unifill__$Utf16_Utf16Impl.code_point_width = function(c) {
	if(!(55296 <= c && c <= 56319)) return 1; else return 2;
};
luxe_utils_unifill__$Utf16_Utf16Impl.find_prev_code_point = function(accessor,index) {
	var c = accessor(index - 1);
	if(!(56320 <= c && c <= 57343)) return 1; else return 2;
};
luxe_utils_unifill__$Utf16_Utf16Impl.encode_code_point = function(addUnit,codePoint) {
	if(codePoint <= 65535) addUnit(codePoint); else {
		addUnit((codePoint >> 10) + 55232);
		addUnit(codePoint & 1023 | 56320);
	}
};
luxe_utils_unifill__$Utf16_Utf16Impl.decode_code_point = function(len,accessor,index) {
	if(index < 0 || len <= index) throw new js__$Boot_HaxeError(luxe_utils_unifill_Exception.InvalidCodeUnitSequence(index));
	var hi = accessor(index);
	if(55296 <= hi && hi <= 56319) {
		if(index + 1 < 0 || len <= index + 1) throw new js__$Boot_HaxeError(luxe_utils_unifill_Exception.InvalidCodeUnitSequence(index));
		var lo = accessor(index + 1);
		if(56320 <= lo && lo <= 57343) return hi - 55232 << 10 | lo & 1023; else throw new js__$Boot_HaxeError(luxe_utils_unifill_Exception.InvalidCodeUnitSequence(index));
	} else if(56320 <= hi && hi <= 57343) throw new js__$Boot_HaxeError(luxe_utils_unifill_Exception.InvalidCodeUnitSequence(index)); else return hi;
};
var luxe_utils_unifill__$Utf16_StringU16Buffer_$Impl_$ = {};
$hxClasses["luxe.utils.unifill._Utf16.StringU16Buffer_Impl_"] = luxe_utils_unifill__$Utf16_StringU16Buffer_$Impl_$;
luxe_utils_unifill__$Utf16_StringU16Buffer_$Impl_$.__name__ = ["luxe","utils","unifill","_Utf16","StringU16Buffer_Impl_"];
luxe_utils_unifill__$Utf16_StringU16Buffer_$Impl_$._new = function() {
	return new StringBuf();
};
luxe_utils_unifill__$Utf16_StringU16Buffer_$Impl_$.addUnit = function(this1,unit) {
	this1.b += String.fromCharCode(unit);
};
luxe_utils_unifill__$Utf16_StringU16Buffer_$Impl_$.getStringU16 = function(this1) {
	return this1.b;
};
var luxe_utils_unifill__$Utf16_StringU16_$Impl_$ = {};
$hxClasses["luxe.utils.unifill._Utf16.StringU16_Impl_"] = luxe_utils_unifill__$Utf16_StringU16_$Impl_$;
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.__name__ = ["luxe","utils","unifill","_Utf16","StringU16_Impl_"];
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.__properties__ = {get_length:"get_length"}
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.fromString = function(s) {
	return s;
};
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.fromCodeUnit = function(u) {
	var s = String.fromCharCode(u);
	return s;
};
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.fromTwoCodeUnits = function(u0,u1) {
	var s = String.fromCharCode(u0) + String.fromCharCode(u1);
	return s;
};
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.ofArray = function(a) {
	var buf_b = "";
	var _g = 0;
	while(_g < a.length) {
		var x = a[_g];
		++_g;
		buf_b += String.fromCharCode(x);
	}
	return buf_b;
};
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.fromArray = function(a) {
	var buf_b = "";
	var _g = 0;
	while(_g < a.length) {
		var x = a[_g];
		++_g;
		buf_b += String.fromCharCode(x);
	}
	return buf_b;
};
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.codeUnitAt = function(this1,index) {
	return this1.charCodeAt(index);
};
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.substr = function(this1,index,len) {
	var s = HxOverrides.substr(this1,index,len);
	return s;
};
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.toString = function(this1) {
	return this1;
};
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.toArray = function(this1) {
	var i = 0;
	var len = this1.length;
	var _g = [];
	while(i < len) _g.push(StringTools.fastCodeAt(this1,i++));
	return _g;
};
luxe_utils_unifill__$Utf16_StringU16_$Impl_$._new = function(s) {
	return s;
};
luxe_utils_unifill__$Utf16_StringU16_$Impl_$.get_length = function(this1) {
	return this1.length;
};
var phoenix_BatchState = function(_r) {
	this.log = false;
	this.batcher = _r;
	this.geom_state = new phoenix_geometry_GeometryState();
	this.last_geom_state = new phoenix_geometry_GeometryState();
};
$hxClasses["phoenix.BatchState"] = phoenix_BatchState;
phoenix_BatchState.__name__ = ["phoenix","BatchState"];
phoenix_BatchState.prototype = {
	active_shader: function() {
		if(this.geom_state.shader != null) return this.geom_state.shader; else if(this.geom_state.texture != null) return this.batcher.renderer.shaders.textured.shader; else return this.batcher.renderer.shaders.plain.shader;
	}
	,activate: function(batcher) {
		if(this.geom_state.dirty) {
			if(this.geom_state.texture != null) {
				if(this.last_texture_id != this.geom_state.texture.id) {
					this.last_texture_id = this.geom_state.texture.id;
					if(this.geom_state.texture.texture != null) this.geom_state.texture.bind();
				}
			} else {
				Luxe.renderer.state.bindTexture2D(null);
				this.last_texture_id = null;
			}
			var _shader;
			if(batcher.shader == null) _shader = this.geom_state.shader; else _shader = batcher.shader;
			if(_shader == null) {
				if(this.geom_state.texture != null) _shader = batcher.renderer.shaders.textured.shader; else _shader = batcher.renderer.shaders.plain.shader;
			}
			if(this.last_shader_id != _shader.program) {
				if(!_shader.no_default_uniforms) {
					_shader.uniforms.set_matrix4_arr("projectionMatrix",batcher.view.proj_arr,snow_modules_opengl_web_GL.gl.getUniformLocation(_shader.program,"projectionMatrix"));
					_shader.uniforms.set_matrix4_arr("modelViewMatrix",batcher.view.view_inverse_arr,snow_modules_opengl_web_GL.gl.getUniformLocation(_shader.program,"modelViewMatrix"));
				}
				_shader["use"]();
				_shader.uniforms.apply();
				Luxe.renderer.state.activeTexture(33984);
				this.last_shader_id = _shader.program;
			}
		}
		if(this.geom_state.clip) {
			if(!this.is_clipping) {
				snow_modules_opengl_web_GL.gl.enable(3089);
				this.is_clipping = true;
			}
			if(this.clip_rect != null) {
				if(!this.clip_rect.equal(this.last_clip_rect)) {
					var _y = batcher.view.viewport.h - (this.clip_rect.y + this.clip_rect.h);
					snow_modules_opengl_web_GL.gl.scissor(this.clip_rect.x | 0,_y | 0,this.clip_rect.w | 0,this.clip_rect.h | 0);
				}
			}
		} else if(this.is_clipping) {
			snow_modules_opengl_web_GL.gl.disable(3089);
			this.is_clipping = false;
		}
		this.geom_state.dirty = false;
	}
	,deactivate: function(batcher) {
		if(this.last_texture_id != null) Luxe.renderer.state.bindTexture2D(null);
		Luxe.renderer.state.useProgram(null);
		if(this.is_clipping) snow_modules_opengl_web_GL.gl.disable(3089);
	}
	,update: function(geom) {
		this.geom_state.clone_onto(this.last_geom_state);
		this.geom_state.update(geom.state);
		if(this.geom_state.clip) {
			this.last_clip_rect = this.clip_rect;
			this.clip_rect = geom.clip_rect;
		}
		return this.geom_state.dirty || this.last_clip_rect != this.clip_rect;
	}
	,str: function() {
		if(!this.log) return;
		haxe_Log.trace("\t+ BATCHSTATE LAST ",{ fileName : "BatchState.hx", lineNumber : 159, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t\tdepth - " + this.last_geom_state.depth,{ fileName : "BatchState.hx", lineNumber : 160, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t\ttexture - " + (this.last_geom_state.texture == null?"null":this.last_geom_state.texture.id),{ fileName : "BatchState.hx", lineNumber : 161, className : "phoenix.BatchState", methodName : "str"});
		if(this.last_geom_state.texture != null) haxe_Log.trace("\t\t\t " + Std.string(this.last_geom_state.texture.texture),{ fileName : "BatchState.hx", lineNumber : 163, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t\tshader - " + (this.last_geom_state.shader == null?"null":this.last_geom_state.shader.id),{ fileName : "BatchState.hx", lineNumber : 165, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t\tprimitive_type - " + this.last_geom_state.primitive_type,{ fileName : "BatchState.hx", lineNumber : 166, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t\tclip - " + Std.string(this.last_geom_state.clip),{ fileName : "BatchState.hx", lineNumber : 167, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t- BATCHSTATE LAST",{ fileName : "BatchState.hx", lineNumber : 168, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t+ BATCHSTATE STATE",{ fileName : "BatchState.hx", lineNumber : 170, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t\tdepth - " + this.geom_state.depth,{ fileName : "BatchState.hx", lineNumber : 171, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t\ttexture - " + (this.geom_state.texture == null?"null":this.geom_state.texture.id),{ fileName : "BatchState.hx", lineNumber : 172, className : "phoenix.BatchState", methodName : "str"});
		if(this.geom_state.texture != null) haxe_Log.trace("\t\t\t " + Std.string(this.geom_state.texture.texture),{ fileName : "BatchState.hx", lineNumber : 174, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t\tshader - " + (this.geom_state.shader == null?"null":this.geom_state.shader.id),{ fileName : "BatchState.hx", lineNumber : 176, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t\tprimitive_type - " + this.geom_state.primitive_type,{ fileName : "BatchState.hx", lineNumber : 177, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t\tclip - " + Std.string(this.geom_state.clip),{ fileName : "BatchState.hx", lineNumber : 178, className : "phoenix.BatchState", methodName : "str"});
		haxe_Log.trace("\t- BATCHSTATE STATE",{ fileName : "BatchState.hx", lineNumber : 179, className : "phoenix.BatchState", methodName : "str"});
	}
	,__class__: phoenix_BatchState
};
var phoenix_Batcher = function(_r,_name,_max_verts) {
	if(_max_verts == null) _max_verts = 16384;
	if(_name == null) _name = "";
	this.normal_floats = 0;
	this.color_floats = 0;
	this.tcoord_floats = 0;
	this.pos_floats = 0;
	this.sequence = -1;
	this.name = "";
	this.log = false;
	this.visible_count = 0;
	this.static_batched_count = 0;
	this.dynamic_batched_count = 0;
	this.draw_calls = 0;
	this.vert_count = 0;
	this.max_floats = 0;
	this.max_verts = 0;
	this.tree_changed = false;
	this.layer = 0;
	this.enabled = true;
	this.id = Luxe.utils.uniqueid();
	this.renderer = _r;
	this.sequence = ++phoenix_Batcher._sequence_key;
	this.geometry = new luxe_structural_BalancedBST_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry($bind(this,this.geometry_compare));
	this.emitter = new luxe_Emitter();
	this.max_verts = _max_verts;
	this.max_floats = this.max_verts * 4;
	var elements = this.max_floats;
	var this1;
	if(elements != null) this1 = new Float32Array(elements); else this1 = null;
	this.pos_list = this1;
	var elements1 = this.max_floats;
	var this2;
	if(elements1 != null) this2 = new Float32Array(elements1); else this2 = null;
	this.tcoord_list = this2;
	var elements2 = this.max_floats;
	var this3;
	if(elements2 != null) this3 = new Float32Array(elements2); else this3 = null;
	this.color_list = this3;
	this.view = this.renderer.camera;
	snow_modules_opengl_web_GL.gl.enableVertexAttribArray(0);
	snow_modules_opengl_web_GL.gl.enableVertexAttribArray(1);
	snow_modules_opengl_web_GL.gl.enableVertexAttribArray(2);
	if(_name.length == 0) this.name = Luxe.utils.uniqueid(); else this.name = _name;
	this._dropped = [];
};
$hxClasses["phoenix.Batcher"] = phoenix_Batcher;
phoenix_Batcher.__name__ = ["phoenix","Batcher"];
phoenix_Batcher.prototype = {
	on: function(event,handler) {
		this.emitter.on(event,handler);
	}
	,off: function(event,handler) {
		return this.emitter.off(event,handler);
	}
	,add: function(_geom,_force_add) {
		if(_force_add == null) _force_add = false;
		if(this.geometry.find(_geom.key) == null || _force_add) {
			if(!Lambda.has(_geom.batchers,this)) _geom.batchers.push(this);
			this.geometry.insert(_geom.key,_geom);
			_geom.added = true;
			this.tree_changed = true;
		} else {
		}
	}
	,empty: function(_drop) {
		if(_drop == null) _drop = true;
		if(_drop) {
			var _g = new luxe_structural_BalancedBSTIterator_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry(this.geometry);
			while(_g.current == null || _g.rightest == null?false:_g.tree.compare(_g.current.key,_g.rightest.key) <= 0) {
				var geom = _g.next();
				geom.drop(true);
				geom = null;
			}
		} else {
			var _g1 = new luxe_structural_BalancedBSTIterator_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry(this.geometry);
			while(_g1.current == null || _g1.rightest == null?false:_g1.tree.compare(_g1.current.key,_g1.rightest.key) <= 0) {
				var geom1 = _g1.next();
				this.geometry.remove(geom1.key);
			}
		}
	}
	,destroy: function(_drop) {
		if(_drop == null) _drop = true;
		this.empty(_drop);
		this.renderer.remove_batch(this);
		this.emitter = null;
		this.geometry = null;
		this.pos_list = null;
		this.tcoord_list = null;
		this.color_list = null;
		this.normal_list = null;
		this.max_verts = 0;
		this.max_floats = 0;
		this.vert_count = 0;
		this.renderer = null;
		this.view = null;
	}
	,remove: function(_geom,_remove_batcher_from_geometry) {
		if(_remove_batcher_from_geometry == null) _remove_batcher_from_geometry = true;
		if(_remove_batcher_from_geometry) {
			HxOverrides.remove(_geom.batchers,this);
			if(_geom.batchers.length == 0) _geom.added = false;
		}
		var countbefore = this.geometry.size();
		this.geometry.remove(_geom.key);
		var countafter = this.geometry.size();
		if(countbefore == countafter) {
		}
		this.tree_changed = true;
	}
	,batch: function(persist_immediate) {
		if(persist_immediate == null) persist_immediate = false;
		this.dynamic_batched_count = 0;
		this.static_batched_count = 0;
		this.visible_count = 0;
		this.pos_floats = 0;
		this.tcoord_floats = 0;
		this.color_floats = 0;
		this.normal_floats = 0;
		this.state = new phoenix_BatchState(this);
		var geom = null;
		var _g = new luxe_structural_BalancedBSTIterator_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry(this.geometry);
		while(_g.current == null || _g.rightest == null?false:_g.tree.compare(_g.current.key,_g.rightest.key) <= 0) {
			var _geom = _g.next();
			geom = _geom;
			if(geom != null && !geom.dropped) {
				if(this.state.update(geom)) this.submit_current_vertex_list(this.state.last_geom_state.primitive_type);
				this.state.activate(this);
				if(geom.visible) {
					this.visible_count++;
					if(geom.buffer_based) {
						this.visible_count--;
						continue;
					}
					if(geom.locked) {
						this.submit_current_vertex_list(this.state.last_geom_state.primitive_type);
						this.submit_static_geometry(geom);
						this.vert_count += geom.vertices.length;
					} else if(geom.state.primitive_type == 3 || geom.state.primitive_type == 2 || geom.state.primitive_type == 5 || geom.state.primitive_type == 6) {
						this.geometry_batch(geom);
						this.submit_current_vertex_list(geom.state.primitive_type);
						this.vert_count += geom.vertices.length;
					} else {
						this.geometry_batch(geom);
						this.dynamic_batched_count++;
						this.vert_count += geom.vertices.length;
					}
					if(!persist_immediate && geom.immediate) {
						geom.dropped = true;
						this._dropped.push(geom);
					}
				}
			}
		}
		if(this.pos_floats > 0 && geom != null) {
			this.state.update(geom);
			this.state.activate(this);
			this.submit_current_vertex_list(this.state.last_geom_state.primitive_type);
		}
		this.state.deactivate(this);
		this.state = null;
		this.prune();
	}
	,prune: function() {
		if(this._dropped.length > 0) {
			var _g = 0;
			var _g1 = this._dropped;
			while(_g < _g1.length) {
				var geom = _g1[_g];
				++_g;
				geom.drop();
				geom = null;
			}
			this._dropped = null;
			this._dropped = [];
		}
	}
	,draw: function(persist_immediate) {
		if(persist_immediate == null) persist_immediate = false;
		this.draw_calls = 0;
		this.vert_count = 0;
		this.emitter.emit(1,this);
		this.view.process();
		this.renderer.state.viewport(this.view.viewport.x,this.view.viewport.y,this.view.viewport.w,this.view.viewport.h);
		this.batch(persist_immediate);
		this.emitter.emit(2,this);
	}
	,update_view: function() {
		this.view.process();
		this.renderer.state.viewport(this.view.viewport.x,this.view.viewport.y,this.view.viewport.w,this.view.viewport.h);
	}
	,apply_default_uniforms: function(_shader) {
		if(!_shader.no_default_uniforms) {
			_shader.uniforms.set_matrix4_arr("projectionMatrix",this.view.proj_arr,snow_modules_opengl_web_GL.gl.getUniformLocation(_shader.program,"projectionMatrix"));
			_shader.uniforms.set_matrix4_arr("modelViewMatrix",this.view.view_inverse_arr,snow_modules_opengl_web_GL.gl.getUniformLocation(_shader.program,"modelViewMatrix"));
		}
	}
	,submit_geometry: function(_geom,_shader) {
		if(!_geom.buffer_based) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_geom.buffer_based" + (" ( " + "Only buffer based geometry can be submitted directly" + " )")));
		if(!_geom.visible) return;
		if(_shader == null) _shader = _geom.state.shader;
		if(this.shader != null) _shader = this.shader;
		_shader["use"]();
		_shader.uniforms.apply();
		Luxe.renderer.state.activeTexture(33984);
		if(!_shader.no_default_uniforms) {
			_shader.uniforms.set_matrix4_arr("projectionMatrix",this.view.proj_arr,snow_modules_opengl_web_GL.gl.getUniformLocation(_shader.program,"projectionMatrix"));
			_shader.uniforms.set_matrix4_arr("modelViewMatrix",this.view.view_inverse_arr,snow_modules_opengl_web_GL.gl.getUniformLocation(_shader.program,"modelViewMatrix"));
		}
		_geom.uniforms.apply();
		var _length = _geom.vertices.length;
		var _length4 = _length * 4;
		var _updated = _geom.update_buffers();
		if(_updated) {
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,_geom.vb_pos);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(0,4,5126,false,0,0);
			snow_modules_opengl_web_GL.gl.bufferData(34962,_geom.buffer_pos,_geom.buffer_type);
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,_geom.vb_tcoords);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(1,4,5126,false,0,0);
			snow_modules_opengl_web_GL.gl.bufferData(34962,_geom.buffer_tcoords,_geom.buffer_type);
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,_geom.vb_colors);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(2,4,5126,false,0,0);
			snow_modules_opengl_web_GL.gl.bufferData(34962,_geom.buffer_colors,_geom.buffer_type);
		} else {
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,_geom.vb_pos);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(0,4,5126,false,0,0);
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,_geom.vb_tcoords);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(1,4,5126,false,0,0);
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,_geom.vb_colors);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(2,4,5126,false,0,0);
		}
		snow_modules_opengl_web_GL.gl.drawArrays(_geom.state.primitive_type,0,_geom.buffer_pos.length / 4 | 0);
		var _stats = this.renderer.stats;
		_stats.geometry_count++;
		_stats.visible_count++;
		_stats.draw_calls++;
		_stats.vert_count += _length;
	}
	,submit_buffers: function(type,_pos,_tcoords,_colors,_normals) {
		var pb = snow_modules_opengl_web_GL.gl.createBuffer();
		var cb = snow_modules_opengl_web_GL.gl.createBuffer();
		var tb = snow_modules_opengl_web_GL.gl.createBuffer();
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,pb);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(0,4,5126,false,0,0);
		snow_modules_opengl_web_GL.gl.bufferData(34962,_pos,35040);
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,tb);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(1,4,5126,false,0,0);
		snow_modules_opengl_web_GL.gl.bufferData(34962,_tcoords,35040);
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,cb);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(2,4,5126,false,0,0);
		snow_modules_opengl_web_GL.gl.bufferData(34962,_colors,35040);
		snow_modules_opengl_web_GL.gl.drawArrays(type,0,_pos.length / 4 | 0);
		snow_modules_opengl_web_GL.gl.deleteBuffer(pb);
		snow_modules_opengl_web_GL.gl.deleteBuffer(cb);
		snow_modules_opengl_web_GL.gl.deleteBuffer(tb);
		this.draw_calls++;
	}
	,submit_static_geometry: function(geom) {
		var _length = geom.vertices.length;
		if(_length == 0) return false;
		var _updated = geom.update_buffers();
		if(_updated) {
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,geom.vb_pos);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(0,4,5126,false,0,0);
			snow_modules_opengl_web_GL.gl.bufferData(34962,geom.buffer_pos,geom.buffer_type);
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,geom.vb_tcoords);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(1,4,5126,false,0,0);
			snow_modules_opengl_web_GL.gl.bufferData(34962,geom.buffer_tcoords,geom.buffer_type);
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,geom.vb_colors);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(2,4,5126,false,0,0);
			snow_modules_opengl_web_GL.gl.bufferData(34962,geom.buffer_colors,geom.buffer_type);
		} else {
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,geom.vb_pos);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(0,4,5126,false,0,0);
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,geom.vb_tcoords);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(1,4,5126,false,0,0);
			snow_modules_opengl_web_GL.gl.bindBuffer(34962,geom.vb_colors);
			snow_modules_opengl_web_GL.gl.vertexAttribPointer(2,4,5126,false,0,0);
		}
		snow_modules_opengl_web_GL.gl.drawArrays(geom.state.primitive_type,0,geom.buffer_pos.length / 4 | 0);
		this.static_batched_count++;
		this.draw_calls++;
		geom.set_dirty(false);
		return true;
	}
	,submit_current_vertex_list: function(type) {
		if(this.pos_floats == 0) return false;
		if(this.pos_floats > this.max_floats) throw new js__$Boot_HaxeError("uh oh, somehow too many floats are being submitted (max:$max_floats, attempt:$pos_floats).");
		var _pos;
		var buffer = this.pos_list.buffer;
		var len = this.pos_floats;
		var this1;
		if(buffer != null) {
			if(len == null) this1 = new Float32Array(buffer,0); else this1 = new Float32Array(buffer,0,len);
		} else this1 = null;
		_pos = this1;
		var _tcoords;
		var buffer1 = this.tcoord_list.buffer;
		var len1 = this.tcoord_floats;
		var this2;
		if(buffer1 != null) {
			if(len1 == null) this2 = new Float32Array(buffer1,0); else this2 = new Float32Array(buffer1,0,len1);
		} else this2 = null;
		_tcoords = this2;
		var _colors;
		var buffer2 = this.color_list.buffer;
		var len2 = this.color_floats;
		var this3;
		if(buffer2 != null) {
			if(len2 == null) this3 = new Float32Array(buffer2,0); else this3 = new Float32Array(buffer2,0,len2);
		} else this3 = null;
		_colors = this3;
		var _normals = null;
		this.submit_buffers(type,_pos,_tcoords,_colors,_normals);
		_pos = null;
		_tcoords = null;
		_colors = null;
		_normals = null;
		this.pos_floats = 0;
		this.tcoord_floats = 0;
		this.color_floats = 0;
		this.normal_floats = 0;
		return true;
	}
	,geometry_batch: function(geom) {
		if(geom.vertices.length > this.max_verts) {
			geom.set_locked(true);
			geom.dirty_based = false;
			haxe_Log.trace("  i / batcher / " + ("WARNING batcher `" + this.name + "` trying to batch a geometry `" + geom.id + "` that has more verts than the batcher has preallocated, (" + geom.vertices.length + " vs max of " + this.max_verts + ")"),{ fileName : "Batcher.hx", lineNumber : 549, className : "phoenix.Batcher", methodName : "geometry_batch"});
			haxe_Log.trace("  i / batcher / " + "WARNING geometry has been marked as direct submit, and will be submitted independently!",{ fileName : "Batcher.hx", lineNumber : 550, className : "phoenix.Batcher", methodName : "geometry_batch"});
			return;
		}
		var _count_after = geom.vertices.length + this.pos_floats / 4;
		if(_count_after > this.max_verts) this.submit_current_vertex_list(geom.state.primitive_type);
		geom.batch(this.pos_floats,this.tcoord_floats,this.color_floats,this.normal_floats,this.pos_list,this.tcoord_list,this.color_list,this.normal_list);
		var _length = geom.vertices.length * 4;
		this.pos_floats += _length;
		this.tcoord_floats += _length;
		this.color_floats += _length;
		this.normal_floats += _length;
	}
	,set_layer: function(_layer) {
		this.layer = _layer;
		this.renderer.batchers.sort(($_=this.renderer,$bind($_,$_.sort_batchers)));
		return this.layer;
	}
	,toString: function() {
		return "Batcher(" + this.name + ")";
	}
	,compare: function(other) {
		if(this.layer == other.layer) return 0;
		if(this.layer < other.layer) return -1;
		return 1;
	}
	,compare_rule_to_string: function(r) {
		switch(r) {
		case 0:
			return "same";
		case 1:
			return "depth <";
		case 2:
			return "depth >";
		case 3:
			return "shader <";
		case 4:
			return "shader >";
		case 5:
			return "shader s._ >";
		case 6:
			return "shader _.s <";
		case 7:
			return "texture <";
		case 8:
			return "texture >";
		case 9:
			return "texture t._ >";
		case 10:
			return "texture _.t <";
		case 11:
			return "primitive <";
		case 12:
			return "primitive >";
		case 13:
			return "unclipped";
		case 14:
			return "clipped";
		case 15:
			return "timestamp <";
		case 16:
			return "timestamp >";
		case 17:
			return "timestamp ==";
		case 18:
			return "sequence <";
		case 19:
			return "sequence >";
		case 20:
			return "fallback";
		default:
			return "unknown";
		}
	}
	,compare_rule: function(a,b) {
		if(a.uuid == b.uuid) return 0;
		if(a.depth < b.depth) return 1;
		if(a.depth > b.depth) return 2;
		if(a.shader != null && b.shader != null) {
			if(a.shader.id < b.shader.id) return 3;
			if(a.shader.id > b.shader.id) return 4;
		} else if(a.shader != null && b.shader == null) return 5; else if(a.shader == null && b.shader != null) return 6;
		if(a.texture != null && b.texture != null) {
			if(a.texture.id < b.texture.id) return 7;
			if(a.texture.id > b.texture.id) return 8;
		} else if(a.texture != null && b.texture == null) return 9; else if(a.texture == null && b.texture != null) return 10;
		var a_primitive_index = a.primitive_type;
		var b_primitive_index = b.primitive_type;
		if(a_primitive_index < b_primitive_index) return 11;
		if(a_primitive_index > b_primitive_index) return 12;
		if(a.clip != b.clip) {
			if(a.clip == false && b.clip == true) return 13; else if(a.clip == true && b.clip == false) return 14;
		}
		if(a.timestamp < b.timestamp) return 15;
		if(a.timestamp > b.timestamp) return 16;
		if(a.timestamp == b.timestamp) return 17;
		if(a.sequence < b.sequence) return 18;
		if(a.sequence > b.sequence) return 19;
		return 20;
	}
	,geometry_compare: function(a,b) {
		if(a.uuid == b.uuid) return 0;
		if(a.depth < b.depth) return -1;
		if(a.depth > b.depth) return 1;
		if(a.shader != null && b.shader != null) {
			if(a.shader.id < b.shader.id) return -1;
			if(a.shader.id > b.shader.id) return 1;
		} else if(a.shader != null && b.shader == null) return 1; else if(a.shader == null && b.shader != null) return -1;
		if(a.texture != null && b.texture != null) {
			if(a.texture.id < b.texture.id) return -1;
			if(a.texture.id > b.texture.id) return 1;
		} else if(a.texture != null && b.texture == null) return 1; else if(a.texture == null && b.texture != null) return -1;
		var a_primitive_index = a.primitive_type;
		var b_primitive_index = b.primitive_type;
		if(a_primitive_index < b_primitive_index) return -1;
		if(a_primitive_index > b_primitive_index) return 1;
		if(a.clip != b.clip) {
			if(a.clip == false && b.clip == true) return 1; else if(a.clip == true && b.clip == false) return -1;
		}
		if(a.timestamp < b.timestamp) return -1;
		if(a.timestamp > b.timestamp) return 1;
		if(a.sequence < b.sequence) return -1;
		if(a.sequence > b.sequence) return 1;
		return 1;
	}
	,list_geometry: function() {
		var _g = new luxe_structural_BalancedBSTIterator_$phoenix_$geometry_$GeometryKey_$phoenix_$geometry_$Geometry(this.geometry);
		while(_g.current == null || _g.rightest == null?false:_g.tree.compare(_g.current.key,_g.rightest.key) <= 0) {
			var geom = _g.next();
			null;
		}
	}
	,__class__: phoenix_Batcher
	,__properties__: {set_layer:"set_layer"}
};
var phoenix_BitmapFont = function(_options) {
	if(_options == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options was null" + ""));
	_options.resource_type = 6;
	luxe_resource_Resource.call(this,_options);
	if(_options.texture_path != null) this.texture_path = _options.texture_path; else this.texture_path = haxe_io_Path.directory(this.id);
	this.pages = new haxe_ds_IntMap();
	if(_options.pages != null) {
		if(_options.font_data == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options.font_data was null" + (" ( " + "BitmapFont create from pages + font_data requires both of those options" + " )")));
	}
	if(_options.font_data != null) {
		if(_options.pages == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options.pages was null" + (" ( " + "BitmapFont create from pages + font_data requires both of those options" + " )")));
		this.set_info(luxe_importers_bitmapfont_BitmapFontParser.parse(_options.font_data));
		this.apply_pages(_options.pages);
	}
};
$hxClasses["phoenix.BitmapFont"] = phoenix_BitmapFont;
phoenix_BitmapFont.__name__ = ["phoenix","BitmapFont"];
phoenix_BitmapFont.__super__ = luxe_resource_Resource;
phoenix_BitmapFont.prototype = $extend(luxe_resource_Resource.prototype,{
	kerning: function(_first,_second) {
		var _map = this.info.kernings.h[_first];
		if(_map != null && _map.h.hasOwnProperty(_second)) return _map.h[_second];
		return 0;
	}
	,wrap_string_to_bounds: function(_string,_bounds,_point_size,_letter_spc) {
		if(_letter_spc == null) _letter_spc = 0.0;
		if(_point_size == null) _point_size = 1.0;
		var _g = this;
		if(_bounds == null) return _string;
		var _cur_x = 0.0;
		var _idx = 0;
		var _final_str = "";
		var _spacew = _g.width_of(" ",_point_size,_letter_spc,null);
		var _strings = _string.split(" ");
		var _count = _strings.length;
		var _g1 = 0;
		while(_g1 < _strings.length) {
			var _str = _strings[_g1];
			++_g1;
			if(luxe_utils_unifill_Unifill.uIndexOf(_str,"\n",null) == -1) {
				if(_str == "") _str = " ";
				var _w = _g.width_of(_str,_point_size,_letter_spc,null);
				if(_cur_x + _w > _bounds.w) {
					_cur_x = 0;
					_final_str += "\n";
				}
				_cur_x += _w;
				_final_str += _str;
			} else {
				var _widx = 0;
				var _words = _str.split("\n");
				var _g11 = 0;
				while(_g11 < _words.length) {
					var _word = _words[_g11];
					++_g11;
					if(_word != "") {
						var _w1 = _g.width_of(_word,_point_size,_letter_spc,null);
						if(_cur_x + _w1 > _bounds.w) {
							_cur_x = 0;
							_final_str += "\n";
						}
						_cur_x += _w1;
						_final_str += _word;
					} else _cur_x = 0;
					if(_widx < _words.length - 1) {
						_final_str += "\n";
						_cur_x = 0;
					}
					_widx++;
				}
			}
			if(_idx < _count - 1) {
				_final_str += " ";
				_cur_x += _spacew + _letter_spc;
			}
			_idx++;
		}
		return _final_str;
	}
	,width_of_line: function(_string,_point_size,_letter_spc) {
		if(_letter_spc == null) _letter_spc = 0.0;
		if(_point_size == null) _point_size = 1.0;
		var _cur_x = 0.0;
		var _cur_w = 0.0;
		var _ratio = _point_size / this.info.point_size;
		var i = 0;
		var _len = luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointCount(_string,0,_string.length);
		var _g_i = 0;
		var _g_string = _string;
		var _g_index = 0;
		var _g_endIndex = _string.length;
		while(_g_index < _g_endIndex) {
			var _uglyph;
			_g_i = _g_index;
			_g_index += luxe_utils_unifill_InternalEncoding.codePointWidthAt(_g_string,_g_index);
			_uglyph = luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointAt(_g_string,_g_i);
			var _index = _uglyph;
			var _char = this.info.chars.h[_index];
			if(_char == null) _char = this.space_char;
			var _cw = (_char.xoffset + Math.max(_char.width,_char.xadvance)) * _ratio;
			var _cx = _cur_x + _char.xoffset * _ratio;
			var _spacing = _char.xadvance;
			if(i < _len - 1) {
				var _next_index = luxe_utils_unifill_Unifill.uCharCodeAt(_string,i + 1);
				_spacing += this.kerning(_index,_next_index);
				if(_next_index >= 32) _spacing += _letter_spc;
			}
			_cur_x += _spacing * _ratio;
			_cur_w = Math.max(_cur_w,_cx + _cw);
			++i;
		}
		return _cur_w;
	}
	,width_of: function(_string,_point_size,_letter_spc,_line_widths) {
		if(_letter_spc == null) _letter_spc = 0.0;
		if(_point_size == null) _point_size = 1.0;
		var _max_w = 0.0;
		var _push_widths = _line_widths != null;
		var _lines = luxe_utils_unifill_Unifill.uSplit(_string,"\n");
		var _g = 0;
		while(_g < _lines.length) {
			var _line = _lines[_g];
			++_g;
			var _cur_w = this.width_of_line(_line,_point_size,_letter_spc);
			_max_w = Math.max(_max_w,_cur_w);
			if(_push_widths) _line_widths.push(_cur_w);
		}
		return _max_w;
	}
	,height_of: function(_string,_point_size,_line_spc) {
		if(_line_spc == null) _line_spc = 0.0;
		return this.height_of_lines(_string.split("\n"),_point_size,_line_spc);
	}
	,dimensions_of: function(_string,_point_size,_into,_letter_spc,_line_spc) {
		if(_line_spc == null) _line_spc = 0.0;
		if(_letter_spc == null) _letter_spc = 0.0;
		var _width = this.width_of(_string,_point_size,_letter_spc,null);
		var _height = this.height_of_lines(_string.split("\n"),_point_size,_line_spc);
		return _into.set_xy(_width,_height);
	}
	,height_of_lines: function(_lines,_point_size,_line_spc) {
		if(_line_spc == null) _line_spc = 0.0;
		var _ratio = _point_size / this.info.point_size;
		return _lines.length * ((this.info.line_height + _line_spc) * _ratio);
	}
	,line_height_to_point_size: function(_pixel_height,_line_spc) {
		if(_line_spc == null) _line_spc = 0.0;
		return _pixel_height * (this.info.point_size / (this.info.line_height + _line_spc));
	}
	,clear: function() {
		this.set_info(null);
		var _i = 0;
		var $it0 = this.pages.keys();
		while( $it0.hasNext() ) {
			var _pageid = $it0.next();
			var _page = this.pages.h[_pageid];
			_page.destroy();
			this.pages.remove(_pageid);
			_page = null;
		}
	}
	,reload: function() {
		var _g = this;
		if(!(this.state != 6)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("state != ResourceState.destroyed" + ""));
		this.clear();
		return new snow_api_Promise(function(resolve,reject) {
			_g.set_state(2);
			var _font_get = snow_systems_assets_AssetText.load(Luxe.core.app.assets,_g.id);
			_font_get.then(function(_asset) {
				_g.set_info(luxe_importers_bitmapfont_BitmapFontParser.parse(_asset.text));
				_asset.destroy();
				_asset = null;
				if(_g.info == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("info was null" + ""));
				var _tex_get = [];
				var _g1 = 0;
				var _g2 = _g.info.pages;
				while(_g1 < _g2.length) {
					var _page = _g2[_g1];
					++_g1;
					var _path = haxe_io_Path.join([_g.texture_path,_page.file]);
					var _prior = _g.system.cache.get(_path);
					if(_prior != null) _tex_get.push(_prior.reload()); else _tex_get.push(_g.system.load_texture(_path));
				}
				snow_api_Promise.all(_tex_get).then(function(_pages) {
					_g.apply_pages(_pages);
					_g.set_state(3);
					resolve(_g);
				}).error(function(_error) {
					_g.set_state(4);
					reject(_error);
				});
			}).error(function(_error1) {
				_g.set_state(4);
				reject(_error1);
			});
		});
	}
	,apply_pages: function(_pages) {
		var _pageid = 0;
		var _g = 0;
		while(_g < _pages.length) {
			var _page = _pages[_g];
			++_g;
			_page.slot = _pageid;
			this.pages.h[_pageid] = _page;
			++_pageid;
		}
	}
	,set_info: function(_info) {
		this.info = _info;
		if(this.info != null) this.space_char = this.info.chars.h[32];
		return this.info;
	}
	,toString: function() {
		return "BitmapFont(" + this.id + ")";
	}
	,__class__: phoenix_BitmapFont
	,__properties__: $extend(luxe_resource_Resource.prototype.__properties__,{set_info:"set_info"})
});
var phoenix_ProjectionType = $hxClasses["phoenix.ProjectionType"] = { __ename__ : ["phoenix","ProjectionType"], __constructs__ : ["ortho","perspective","custom"] };
phoenix_ProjectionType.ortho = ["ortho",0];
phoenix_ProjectionType.ortho.toString = $estr;
phoenix_ProjectionType.ortho.__enum__ = phoenix_ProjectionType;
phoenix_ProjectionType.perspective = ["perspective",1];
phoenix_ProjectionType.perspective.toString = $estr;
phoenix_ProjectionType.perspective.__enum__ = phoenix_ProjectionType;
phoenix_ProjectionType.custom = ["custom",2];
phoenix_ProjectionType.custom.toString = $estr;
phoenix_ProjectionType.custom.__enum__ = phoenix_ProjectionType;
var phoenix_Camera = function(_options) {
	this.refresh_pos_ = false;
	this.up_ = new phoenix_Vector(0,1,0);
	this.setup_ = true;
	this.look_at_dirty = true;
	this.projection_dirty = true;
	this.transform_dirty = true;
	this.minimum_zoom = 0.01;
	this.depth_test = false;
	this.cull_backfaces = false;
	this.aspect = 1.5;
	this.fov_type = phoenix_FOVType.horizontal;
	this.fov = 60;
	this.far = -1000;
	this.near = 1000;
	this.zoom = 1.0;
	this.name = "camera";
	this.transform = new phoenix_Transform();
	this.projection_matrix = new phoenix_Matrix();
	this.view_matrix = new phoenix_Matrix();
	this.view_matrix_inverse = new phoenix_Matrix();
	this.look_at_matrix = new phoenix_Matrix();
	if(_options == null) _options = { projection : phoenix_ProjectionType.ortho, depth_test : false, cull_backfaces : false, near : 1000, far : -1000};
	_options;
	if(_options.projection == null) _options.projection = phoenix_ProjectionType.ortho;
	this.projection = _options.projection;
	this.set_center(new phoenix_Vector(Luxe.core.screen.get_w() / 2,Luxe.core.screen.get_h() / 2));
	this.set_pos(new phoenix_Vector());
	this.set_viewport((function($this) {
		var $r;
		if(_options.viewport == null) _options.viewport = new phoenix_Rectangle(0,0,Luxe.core.screen.get_w(),Luxe.core.screen.get_h());
		$r = _options.viewport;
		return $r;
	}(this)));
	if(_options.camera_name != null) this.name = _options.camera_name;
	this.transform.listen($bind(this,this.on_transform_cleaned));
	var _g = this.projection;
	switch(_g[1]) {
	case 0:
		this.set_ortho(_options);
		break;
	case 1:
		this.set_perspective(_options);
		break;
	case 2:
		break;
	}
	this.process();
	this.setup_ = false;
};
$hxClasses["phoenix.Camera"] = phoenix_Camera;
phoenix_Camera.__name__ = ["phoenix","Camera"];
phoenix_Camera.prototype = {
	set_ortho: function(_options) {
		this.projection = phoenix_ProjectionType.ortho;
		this.apply_default_camera_options();
		if(_options.aspect != null) {
			this.projection_dirty = true;
			this.aspect = _options.aspect;
		}
		if(_options.far != null) {
			this.projection_dirty = true;
			this.far = _options.far;
		}
		if(_options.fov != null) this.set_fov(_options.fov);
		if(_options.near != null) {
			this.projection_dirty = true;
			this.near = _options.near;
		}
		if(_options.viewport != null) this.set_viewport(_options.viewport);
		if(_options.cull_backfaces != null) this.cull_backfaces = _options.cull_backfaces;
		if(_options.depth_test != null) this.depth_test = _options.depth_test;
		if(_options.fov_type != null) {
			this.fov_type = _options.fov_type;
			this.set_fov(this.fov);
			this.fov_type;
		} else {
			this.fov_type = phoenix_FOVType.horizontal;
			this.set_fov(this.fov);
			this.fov_type;
		}
	}
	,set_perspective: function(_options) {
		this.projection = phoenix_ProjectionType.perspective;
		this.apply_default_camera_options();
		if(_options.aspect != null) {
			this.projection_dirty = true;
			this.aspect = _options.aspect;
		}
		if(_options.far != null) {
			this.projection_dirty = true;
			this.far = _options.far;
		}
		if(_options.fov != null) this.set_fov(_options.fov);
		if(_options.near != null) {
			this.projection_dirty = true;
			this.near = _options.near;
		}
		if(_options.viewport != null) this.set_viewport(_options.viewport);
		if(_options.cull_backfaces != null) this.cull_backfaces = _options.cull_backfaces;
		if(_options.depth_test != null) this.depth_test = _options.depth_test;
		if(_options.fov_type != null) {
			this.fov_type = _options.fov_type;
			this.set_fov(this.fov);
			this.fov_type;
		} else {
			this.fov_type = phoenix_FOVType.horizontal;
			this.set_fov(this.fov);
			this.fov_type;
		}
		this.transform.origin.set_xyz(0,0,0);
	}
	,project: function(_vector) {
		this.update_view_matrix();
		var _transform = new phoenix_Matrix().multiplyMatrices(this.projection_matrix,this.view_matrix_inverse);
		return new phoenix_Vector(_vector.x,_vector.y,_vector.z,_vector.w).applyProjection(_transform);
	}
	,unproject: function(_vector) {
		this.update_view_matrix();
		var _inverted = new phoenix_Matrix().multiplyMatrices(this.projection_matrix,this.view_matrix_inverse);
		return new phoenix_Vector(_vector.x,_vector.y,_vector.z,_vector.w).applyProjection(_inverted.getInverse(_inverted));
	}
	,screen_point_to_ray: function(_vector) {
		return new phoenix_Ray(_vector,this);
	}
	,screen_point_to_world: function(_vector) {
		if(this.projection == phoenix_ProjectionType.ortho) {
			this.update_view_matrix();
			return new phoenix_Vector(_vector.x,_vector.y,_vector.z,_vector.w).transform(this.view_matrix);
		} else if(this.projection == phoenix_ProjectionType.perspective) return this.screen_point_to_ray(_vector).end;
		this.update_view_matrix();
		return new phoenix_Vector(_vector.x,_vector.y,_vector.z,_vector.w).transform(this.view_matrix);
	}
	,world_point_to_screen: function(_vector,_viewport) {
		if(this.projection == phoenix_ProjectionType.ortho) {
			this.update_view_matrix();
			return new phoenix_Vector(_vector.x,_vector.y,_vector.z,_vector.w).transform(this.view_matrix_inverse);
		} else if(this.projection == phoenix_ProjectionType.perspective) return this.persepective_world_to_screen(_vector,_viewport);
		this.update_view_matrix();
		return new phoenix_Vector(_vector.x,_vector.y,_vector.z,_vector.w).transform(this.view_matrix_inverse);
	}
	,process: function() {
		if(this.target != null) this.update_look_at();
		this.update_projection_matrix();
		this.update_view_matrix();
		if(this.cull_backfaces) Luxe.renderer.state.enable(2884); else Luxe.renderer.state.disable(2884);
		if(this.depth_test) Luxe.renderer.state.enable(2929); else Luxe.renderer.state.disable(2929);
	}
	,on_transform_cleaned: function(t) {
		this.transform_dirty = true;
	}
	,update_look_at: function() {
		if(this.look_at_dirty && this.target != null) {
			this.look_at_matrix.lookAt(this.target,this.pos,this.up_);
			this.transform.local.rotation.setFromRotationMatrix(this.look_at_matrix);
		}
	}
	,update_view_matrix: function() {
		this.view_matrix = this.transform.get_world().get_matrix();
		if(!this.transform_dirty) return;
		this.view_matrix_inverse = this.view_matrix.inverse();
		this.view_inverse_arr = this.view_matrix_inverse.float32array();
		this.transform_dirty = false;
	}
	,update_projection_matrix: function() {
		if(!this.projection_dirty) return;
		var _g = this.projection;
		switch(_g[1]) {
		case 2:
			break;
		case 1:
			this.projection_matrix.makePerspective(this.fov_y,this.aspect,this.near,this.far);
			break;
		case 0:
			var _l = 0.0;
			var _t = 0.0;
			var _r = this.viewport.w;
			var _b = this.viewport.h;
			if(this.ortho_left != null) _l = this.ortho_left;
			if(this.ortho_right != null) _r = this.ortho_right;
			if(this.ortho_top != null) _t = this.ortho_top;
			if(this.ortho_bottom != null) _b = this.ortho_bottom;
			this.projection_matrix.makeOrthographic(_l,_r,_t,_b,this.near,this.far);
			break;
		}
		this.proj_arr = this.projection_matrix.float32array();
		this.projection_dirty = false;
	}
	,apply_state: function(state,value) {
		if(value) Luxe.renderer.state.enable(state); else Luxe.renderer.state.disable(state);
	}
	,apply_default_camera_options: function() {
		var _g = this.projection;
		switch(_g[1]) {
		case 0:
			this.cull_backfaces = false;
			this.depth_test = false;
			break;
		case 1:
			this.cull_backfaces = true;
			this.depth_test = true;
			break;
		case 2:
			break;
		}
	}
	,default_camera_options: function() {
		return { projection : phoenix_ProjectionType.ortho, depth_test : false, cull_backfaces : false, near : 1000, far : -1000};
	}
	,ortho_screen_to_world: function(_vector) {
		this.update_view_matrix();
		return new phoenix_Vector(_vector.x,_vector.y,_vector.z,_vector.w).transform(this.view_matrix);
	}
	,ortho_world_to_screen: function(_vector) {
		this.update_view_matrix();
		return new phoenix_Vector(_vector.x,_vector.y,_vector.z,_vector.w).transform(this.view_matrix_inverse);
	}
	,persepective_world_to_screen: function(_vector,_viewport) {
		if(_viewport == null) _viewport = this.viewport;
		_viewport;
		var _projected = this.project(_vector);
		var width_half = _viewport.w / 2;
		var height_half = _viewport.h / 2;
		return new phoenix_Vector(_projected.x * width_half + width_half,-(_projected.y * height_half) + height_half);
	}
	,set_target: function(_target) {
		if(_target != null) this.look_at_dirty = true;
		return this.target = _target;
	}
	,set_fov: function(_fov) {
		this.projection_dirty = true;
		if(this.fov_type == phoenix_FOVType.horizontal) this.fov_y = 180 / Math.PI * (2 * Math.atan(Math.tan(_fov * (Math.PI / 180) / 2) * (1 / this.aspect))); else this.fov_y = _fov;
		return this.fov = _fov;
	}
	,set_fov_type: function(_fov_type) {
		this.fov_type = _fov_type;
		this.set_fov(this.fov);
		return this.fov_type;
	}
	,set_aspect: function(_aspect) {
		this.projection_dirty = true;
		return this.aspect = _aspect;
	}
	,set_near: function(_near) {
		this.projection_dirty = true;
		return this.near = _near;
	}
	,set_far: function(_far) {
		this.projection_dirty = true;
		return this.far = _far;
	}
	,set_ortho_left: function(_val) {
		this.projection_dirty = true;
		return this.ortho_left = _val;
	}
	,set_ortho_right: function(_val) {
		this.projection_dirty = true;
		return this.ortho_right = _val;
	}
	,set_ortho_top: function(_val) {
		this.projection_dirty = true;
		return this.ortho_top = _val;
	}
	,set_ortho_bottom: function(_val) {
		this.projection_dirty = true;
		return this.ortho_bottom = _val;
	}
	,set_zoom: function(_z) {
		var _new_zoom = _z;
		if(_new_zoom < this.minimum_zoom) _new_zoom = this.minimum_zoom;
		var _g = this.projection;
		switch(_g[1]) {
		case 0:
			this.transform.local.scale.set_x(1 / _new_zoom);
			this.transform.local.scale.set_y(1 / _new_zoom);
			this.transform.local.scale.set_z(1 / _new_zoom);
			break;
		case 1:
			break;
		case 2:
			break;
		}
		return this.zoom = _new_zoom;
	}
	,set_center: function(_p) {
		this.center = _p;
		var _g = this.projection;
		switch(_g[1]) {
		case 0:
			if(!this.refresh_pos_ && !this.setup_) {
				this.pos.ignore_listeners = true;
				this.pos.set_x(_p.x - this.viewport.w / 2);
				this.pos.set_y(_p.y - this.viewport.h / 2);
				this.pos.ignore_listeners = false;
				this.transform.local.pos.copy_from(_p);
			}
			break;
		case 1:
			break;
		case 2:
			break;
		}
		phoenix_Vector.Listen(this.center,$bind(this,this._center_changed));
		return this.center;
	}
	,get_center: function() {
		return this.center;
	}
	,get_pos: function() {
		return this.pos;
	}
	,get_rotation: function() {
		return this.transform.local.rotation;
	}
	,get_scale: function() {
		return this.transform.local.scale;
	}
	,get_viewport: function() {
		return this.viewport;
	}
	,set_viewport: function(_r) {
		this.projection_dirty = true;
		this.viewport = _r;
		var _g = this.projection;
		switch(_g[1]) {
		case 0:
			this.transform.set_origin(new phoenix_Vector(_r.w / 2,_r.h / 2));
			this.set_pos(this.pos);
			break;
		case 1:
			break;
		case 2:
			break;
		}
		return this.viewport;
	}
	,set_rotation: function(_q) {
		return this.transform.local.set_rotation(_q);
	}
	,set_scale: function(_s) {
		return this.transform.local.set_scale(_s);
	}
	,set_pos: function(_p) {
		this.pos = _p;
		var _g = this.projection;
		switch(_g[1]) {
		case 0:
			var _cx = this.center.x;
			var _cy = this.center.y;
			if(this.viewport != null) {
				_cx = _p.x + this.viewport.w / 2;
				_cy = _p.y + this.viewport.h / 2;
			}
			this.refresh_pos_ = true;
			this.center.ignore_listeners = true;
			this.center.set_x(_cx);
			this.center.set_y(_cy);
			this.center.ignore_listeners = false;
			this.refresh_pos_ = false;
			this.transform.local.pos.set_x(_cx);
			this.transform.local.pos.set_y(_cy);
			break;
		case 1:
			this.transform.local.set_pos(this.pos);
			break;
		case 2:
			break;
		}
		phoenix_Vector.Listen(this.pos,$bind(this,this._pos_changed));
		return this.pos;
	}
	,_merge_options: function(_o) {
		this.apply_default_camera_options();
		if(_o.aspect != null) {
			this.projection_dirty = true;
			this.aspect = _o.aspect;
		}
		if(_o.far != null) {
			this.projection_dirty = true;
			this.far = _o.far;
		}
		if(_o.fov != null) this.set_fov(_o.fov);
		if(_o.near != null) {
			this.projection_dirty = true;
			this.near = _o.near;
		}
		if(_o.viewport != null) this.set_viewport(_o.viewport);
		if(_o.cull_backfaces != null) this.cull_backfaces = _o.cull_backfaces;
		if(_o.depth_test != null) this.depth_test = _o.depth_test;
		if(_o.fov_type != null) {
			this.fov_type = _o.fov_type;
			this.set_fov(this.fov);
			this.fov_type;
		} else {
			this.fov_type = phoenix_FOVType.horizontal;
			this.set_fov(this.fov);
			this.fov_type;
		}
	}
	,_pos_changed: function(v) {
		this.set_pos(this.pos);
	}
	,_center_changed: function(v) {
		this.set_center(this.center);
	}
	,__class__: phoenix_Camera
	,__properties__: {set_ortho_bottom:"set_ortho_bottom",set_ortho_top:"set_ortho_top",set_ortho_right:"set_ortho_right",set_ortho_left:"set_ortho_left",set_rotation:"set_rotation",get_rotation:"get_rotation",set_scale:"set_scale",get_scale:"get_scale",set_pos:"set_pos",get_pos:"get_pos",set_target:"set_target",set_aspect:"set_aspect",set_fov_type:"set_fov_type",set_fov:"set_fov",set_far:"set_far",set_near:"set_near",set_zoom:"set_zoom",set_center:"set_center",get_center:"get_center",set_viewport:"set_viewport",get_viewport:"get_viewport"}
};
var phoenix_FOVType = $hxClasses["phoenix.FOVType"] = { __ename__ : ["phoenix","FOVType"], __constructs__ : ["vertical","horizontal"] };
phoenix_FOVType.vertical = ["vertical",0];
phoenix_FOVType.vertical.toString = $estr;
phoenix_FOVType.vertical.__enum__ = phoenix_FOVType;
phoenix_FOVType.horizontal = ["horizontal",1];
phoenix_FOVType.horizontal.toString = $estr;
phoenix_FOVType.horizontal.__enum__ = phoenix_FOVType;
var phoenix_ColorHSL = function(_h,_s,_l,_a) {
	if(_a == null) _a = 1.0;
	if(_l == null) _l = 1.0;
	if(_s == null) _s = 1.0;
	if(_h == null) _h = 0.0;
	this.l = 1.0;
	this.s = 1.0;
	this.h = 0.0;
	phoenix_Color.call(this);
	this.is_hsl = true;
	this.set_h(_h);
	this.set_s(_s);
	this.set_l(_l);
	this.a = _a;
	this._refresh();
};
$hxClasses["phoenix.ColorHSL"] = phoenix_ColorHSL;
phoenix_ColorHSL.__name__ = ["phoenix","ColorHSL"];
phoenix_ColorHSL.__super__ = phoenix_Color;
phoenix_ColorHSL.prototype = $extend(phoenix_Color.prototype,{
	set_h: function(_h) {
		this.h = _h;
		this._refresh();
		return _h;
	}
	,set_s: function(_s) {
		this.s = _s;
		this._refresh();
		return _s;
	}
	,set_l: function(_l) {
		this.l = _l;
		this._refresh();
		return _l;
	}
	,set: function(_h,_s,_l,_a) {
		var _seth = this.h;
		var _sets = this.s;
		var _setl = this.l;
		var _seta = this.a;
		if(_h != null) _seth = _h;
		if(_s != null) _sets = _s;
		if(_l != null) _setl = _l;
		if(_a != null) _seta = _a;
		this.set_h(_seth);
		this.set_s(_sets);
		this.set_l(_setl);
		this.a = _seta;
		this._refresh();
		return this;
	}
	,tween: function(_time_in_seconds,_dest,_override) {
		if(_override == null) _override = true;
		if(_time_in_seconds == null) _time_in_seconds = 0.5;
		phoenix_Color.prototype.tween.call(this,_time_in_seconds,_dest,_override);
		if(_dest != null) {
			var _dest_h = this.h;
			var _dest_s = this.s;
			var _dest_l = this.l;
			var _dest_a = this.a;
			var _change_h = false;
			var _change_s = false;
			var _change_l = false;
			var _change_a = false;
			if(js_Boot.__instanceof(_dest,phoenix_ColorHSL)) {
				_dest_h = _dest.h;
				_dest_s = _dest.s;
				_dest_l = _dest.l;
				_dest_a = _dest.a;
				_change_h = true;
				_change_s = true;
				_change_l = true;
				_change_a = true;
			} else {
				if(_dest.h != null) {
					_dest_h = _dest.h;
					_change_h = true;
				}
				if(_dest.s != null) {
					_dest_s = _dest.s;
					_change_s = true;
				}
				if(_dest.l != null) {
					_dest_l = _dest.l;
					_change_l = true;
				}
				if(_dest.a != null) {
					_dest_a = _dest.a;
					_change_a = true;
				}
			}
			var _properties = { };
			if(_change_h) _properties.h = _dest_h;
			if(_change_s) _properties.s = _dest_s;
			if(_change_l) _properties.l = _dest_l;
			if(_change_a) _properties.a = _dest_a;
			return luxe_tween_Actuate.tween(this,_time_in_seconds,_properties,_override);
		} else throw new js__$Boot_HaxeError(" Warning: Color.tween passed a null destination ");
	}
	,_refresh: function() {
		this.refreshing = true;
		phoenix_Color.prototype.fromColorHSL.call(this,this);
		this.refreshing = false;
		return this;
	}
	,clone: function() {
		return new phoenix_ColorHSL(this.h,this.s,this.l,this.a);
	}
	,toColor: function() {
		return this._refresh();
	}
	,fromColor: function(_color) {
		var max = _color.maxRGB();
		var min = _color.minRGB();
		var add = max + min;
		var sub = max - min;
		var _h = 0;
		if(max == min) _h = 0; else if(max == _color.r) _h = (60 * (_color.g - _color.b) / sub + 360) % 360; else if(max == _color.g) _h = 60 * (_color.b - _color.r) / sub + 120; else if(max == _color.b) _h = 60 * (_color.r - _color.g) / sub + 240;
		var _l = add / 2;
		var _s;
		if(max == min) _s = 0; else if(this.l <= 0.5) _s = sub / add; else _s = sub / (2 - add);
		this.set_h(_h);
		this.set_s(_s);
		this.set_l(_l);
		this.a = _color.a;
		return this;
	}
	,toString: function() {
		return "{ h:" + this.h + " , s:" + this.s + " , l:" + this.l + " , a:" + this.a + " }";
	}
	,__class__: phoenix_ColorHSL
	,__properties__: $extend(phoenix_Color.prototype.__properties__,{set_l:"set_l",set_s:"set_s",set_h:"set_h"})
});
var phoenix_ColorHSV = function(_h,_s,_v,_a) {
	if(_a == null) _a = 1.0;
	if(_v == null) _v = 1.0;
	if(_s == null) _s = 0.0;
	if(_h == null) _h = 0.0;
	this.v = 1.0;
	this.s = 0.0;
	this.h = 0.0;
	phoenix_Color.call(this);
	this.is_hsv = true;
	this.set_h(_h);
	this.set_s(_s);
	this.set_v(_v);
	this.a = _a;
	this._refresh();
};
$hxClasses["phoenix.ColorHSV"] = phoenix_ColorHSV;
phoenix_ColorHSV.__name__ = ["phoenix","ColorHSV"];
phoenix_ColorHSV.__super__ = phoenix_Color;
phoenix_ColorHSV.prototype = $extend(phoenix_Color.prototype,{
	set_h: function(_h) {
		this.h = _h;
		this._refresh();
		return _h;
	}
	,set_s: function(_s) {
		this.s = _s;
		this._refresh();
		return this.s;
	}
	,set_v: function(_v) {
		this.v = _v;
		this._refresh();
		return this.v;
	}
	,set: function(_h,_s,_v,_a) {
		var _seth = this.h;
		var _sets = this.s;
		var _setv = this.v;
		var _seta = this.a;
		if(_h != null) _seth = _h;
		if(_s != null) _sets = _s;
		if(_v != null) _setv = _v;
		if(_a != null) _seta = _a;
		this.set_h(_seth);
		this.set_s(_sets);
		this.set_v(_setv);
		this.a = _seta;
		this._refresh();
		return this;
	}
	,tween: function(_time_in_seconds,_dest,_override) {
		if(_override == null) _override = true;
		if(_time_in_seconds == null) _time_in_seconds = 0.5;
		phoenix_Color.prototype.tween.call(this,_time_in_seconds,_dest,_override);
		if(_dest != null) {
			var _dest_h = this.h;
			var _dest_s = this.s;
			var _dest_v = this.v;
			var _dest_a = this.a;
			var _change_h = false;
			var _change_s = false;
			var _change_v = false;
			var _change_a = false;
			if(js_Boot.__instanceof(_dest,phoenix_ColorHSV)) {
				_dest_h = _dest.h;
				_dest_s = _dest.s;
				_dest_v = _dest.v;
				_dest_a = _dest.a;
				_change_h = true;
				_change_s = true;
				_change_v = true;
				_change_a = true;
			} else {
				if(_dest.h != null) {
					_dest_h = _dest.h;
					_change_h = true;
				}
				if(_dest.s != null) {
					_dest_s = _dest.s;
					_change_s = true;
				}
				if(_dest.v != null) {
					_dest_v = _dest.v;
					_change_v = true;
				}
				if(_dest.a != null) {
					_dest_a = _dest.a;
					_change_a = true;
				}
			}
			var _properties = { };
			if(_change_h) _properties.h = _dest_h;
			if(_change_s) _properties.s = _dest_s;
			if(_change_v) _properties.v = _dest_v;
			if(_change_a) _properties.a = _dest_a;
			return luxe_tween_Actuate.tween(this,_time_in_seconds,_properties,_override);
		} else throw new js__$Boot_HaxeError(" Warning: Color.tween passed a null destination ");
	}
	,_refresh: function() {
		this.refreshing = true;
		phoenix_Color.prototype.fromColorHSV.call(this,this);
		this.refreshing = false;
		return this;
	}
	,clone: function() {
		return new phoenix_ColorHSV(this.h,this.s,this.v,this.a);
	}
	,toColor: function() {
		return this._refresh();
	}
	,toColorHSL: function() {
		this._refresh();
		return phoenix_Color.prototype.toColorHSL.call(this);
	}
	,fromColorHSL: function(_color_hsl) {
		_color_hsl._refresh();
		return this.fromColor(_color_hsl);
	}
	,fromColor: function(_color) {
		var max = _color.maxRGB();
		var min = _color.minRGB();
		var add = max + min;
		var sub = max - min;
		var _h = 0;
		if(max == min) _h = 0; else if(max == _color.r) _h = (60 * (_color.g - _color.b) / sub + 360) % 360; else if(max == _color.g) _h = 60 * (_color.b - _color.r) / sub + 120; else if(max == _color.b) _h = 60 * (_color.r - _color.g) / sub + 240;
		var _s;
		if(max == 0) _s = 0; else _s = 1 - min / max;
		this.set_h(_h);
		this.set_s(_s);
		this.set_v(max);
		this.a = _color.a;
		return this;
	}
	,toString: function() {
		return "{ h:" + this.h + " , s:" + this.s + " , v:" + this.v + " , a:" + this.a + " }";
	}
	,__class__: phoenix_ColorHSV
	,__properties__: $extend(phoenix_Color.prototype.__properties__,{set_v:"set_v",set_s:"set_s",set_h:"set_h"})
});
var phoenix_MatrixTransform = function(p,r,s) {
	this.pos = p;
	this.rotation = r;
	this.scale = s;
};
$hxClasses["phoenix.MatrixTransform"] = phoenix_MatrixTransform;
phoenix_MatrixTransform.__name__ = ["phoenix","MatrixTransform"];
phoenix_MatrixTransform.prototype = {
	destroy: function() {
		this.pos = null;
		this.rotation = null;
		this.scale = null;
	}
	,__class__: phoenix_MatrixTransform
};
var phoenix_Matrix = function(n11,n12,n13,n14,n21,n22,n23,n24,n31,n32,n33,n34,n41,n42,n43,n44) {
	if(n44 == null) n44 = 1;
	if(n43 == null) n43 = 0;
	if(n42 == null) n42 = 0;
	if(n41 == null) n41 = 0;
	if(n34 == null) n34 = 0;
	if(n33 == null) n33 = 1;
	if(n32 == null) n32 = 0;
	if(n31 == null) n31 = 0;
	if(n24 == null) n24 = 0;
	if(n23 == null) n23 = 0;
	if(n22 == null) n22 = 1;
	if(n21 == null) n21 = 0;
	if(n14 == null) n14 = 0;
	if(n13 == null) n13 = 0;
	if(n12 == null) n12 = 0;
	if(n11 == null) n11 = 1;
	this.M44 = 1;
	this.M34 = 0;
	this.M24 = 0;
	this.M14 = 0;
	this.M43 = 0;
	this.M33 = 1;
	this.M23 = 0;
	this.M13 = 0;
	this.M42 = 0;
	this.M32 = 0;
	this.M22 = 1;
	this.M12 = 0;
	this.M41 = 0;
	this.M31 = 0;
	this.M21 = 0;
	this.M11 = 1;
	this.elements = [];
	var i = 0;
	while(i++ < 16) this.elements.push(0.0);
	this.set(n11,n12,n13,n14,n21,n22,n23,n24,n31,n32,n33,n34,n41,n42,n43,n44);
	var array = this.elements;
	var this1;
	if(array != null) this1 = new Float32Array(array); else this1 = null;
	this._float32array = this1;
};
$hxClasses["phoenix.Matrix"] = phoenix_Matrix;
phoenix_Matrix.__name__ = ["phoenix","Matrix"];
phoenix_Matrix.prototype = {
	set: function(n11,n12,n13,n14,n21,n22,n23,n24,n31,n32,n33,n34,n41,n42,n43,n44) {
		var e = this.elements;
		e[0] = n11;
		e[4] = n12;
		e[8] = n13;
		e[12] = n14;
		e[1] = n21;
		e[5] = n22;
		e[9] = n23;
		e[13] = n24;
		e[2] = n31;
		e[6] = n32;
		e[10] = n33;
		e[14] = n34;
		e[3] = n41;
		e[7] = n42;
		e[11] = n43;
		e[15] = n44;
		return this;
	}
	,toString: function() {
		var e = this.elements;
		var str = "{ 11:" + luxe_utils_Maths.fixed(e[0],3) + ", 12:" + luxe_utils_Maths.fixed(e[4],3) + ", 13:" + luxe_utils_Maths.fixed(e[8],3) + ", 14:" + luxe_utils_Maths.fixed(e[12],3) + " }, " + "{ 21:" + luxe_utils_Maths.fixed(e[1],3) + ", 22:" + luxe_utils_Maths.fixed(e[5],3) + ", 23:" + luxe_utils_Maths.fixed(e[9],3) + ", 24:" + luxe_utils_Maths.fixed(e[13],3) + " }, " + "{ 31:" + luxe_utils_Maths.fixed(e[2],3) + ", 32:" + luxe_utils_Maths.fixed(e[6],3) + ", 33:" + luxe_utils_Maths.fixed(e[10],3) + ", 34:" + luxe_utils_Maths.fixed(e[14],3) + " }, " + "{ 41:" + luxe_utils_Maths.fixed(e[3],3) + ", 42:" + luxe_utils_Maths.fixed(e[7],3) + ", 43:" + luxe_utils_Maths.fixed(e[11],3) + ", 44:" + luxe_utils_Maths.fixed(e[15],3) + " }";
		return str;
	}
	,get_M11: function() {
		return this.elements[0];
	}
	,get_M12: function() {
		return this.elements[1];
	}
	,get_M13: function() {
		return this.elements[2];
	}
	,get_M14: function() {
		return this.elements[3];
	}
	,get_M21: function() {
		return this.elements[4];
	}
	,get_M22: function() {
		return this.elements[5];
	}
	,get_M23: function() {
		return this.elements[6];
	}
	,get_M24: function() {
		return this.elements[7];
	}
	,get_M31: function() {
		return this.elements[8];
	}
	,get_M32: function() {
		return this.elements[9];
	}
	,get_M33: function() {
		return this.elements[10];
	}
	,get_M34: function() {
		return this.elements[11];
	}
	,get_M41: function() {
		return this.elements[12];
	}
	,get_M42: function() {
		return this.elements[13];
	}
	,get_M43: function() {
		return this.elements[14];
	}
	,get_M44: function() {
		return this.elements[15];
	}
	,set_M11: function(_value) {
		this.elements[0] = _value;
		return _value;
	}
	,set_M12: function(_value) {
		this.elements[1] = _value;
		return _value;
	}
	,set_M13: function(_value) {
		this.elements[2] = _value;
		return _value;
	}
	,set_M14: function(_value) {
		this.elements[3] = _value;
		return _value;
	}
	,set_M21: function(_value) {
		this.elements[4] = _value;
		return _value;
	}
	,set_M22: function(_value) {
		this.elements[5] = _value;
		return _value;
	}
	,set_M23: function(_value) {
		this.elements[6] = _value;
		return _value;
	}
	,set_M24: function(_value) {
		this.elements[7] = _value;
		return _value;
	}
	,set_M31: function(_value) {
		this.elements[8] = _value;
		return _value;
	}
	,set_M32: function(_value) {
		this.elements[9] = _value;
		return _value;
	}
	,set_M33: function(_value) {
		this.elements[10] = _value;
		return _value;
	}
	,set_M34: function(_value) {
		this.elements[11] = _value;
		return _value;
	}
	,set_M41: function(_value) {
		this.elements[12] = _value;
		return _value;
	}
	,set_M42: function(_value) {
		this.elements[13] = _value;
		return _value;
	}
	,set_M43: function(_value) {
		this.elements[14] = _value;
		return _value;
	}
	,set_M44: function(_value) {
		this.elements[15] = _value;
		return _value;
	}
	,float32array: function() {
		var i = 0;
		while(i < 16) {
			this._float32array[i] = this.elements[i];
			++i;
		}
		return this._float32array;
	}
	,identity: function() {
		this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
		return this;
	}
	,copy: function(m) {
		var me = m.elements;
		this.set(me[0],me[4],me[8],me[12],me[1],me[5],me[9],me[13],me[2],me[6],me[10],me[14],me[3],me[7],me[11],me[15]);
		return this;
	}
	,make2D: function(_x,_y,_scale,_rotation) {
		if(_rotation == null) _rotation = 0;
		if(_scale == null) _scale = 1;
		var theta = _rotation * 0.017453292519943278;
		var c = Math.cos(theta);
		var s = Math.sin(theta);
		this.set(c * _scale,s * _scale,0,_x,-s * _scale,c * _scale,0,_y,0,0,1,0,0,0,0,1);
		return this;
	}
	,copyPosition: function(m) {
		this.elements[12] = m.elements[12];
		this.elements[13] = m.elements[13];
		this.elements[14] = m.elements[14];
		return this;
	}
	,getPosition: function() {
		return new phoenix_Vector(this.elements[12],this.elements[13],this.elements[14],1);
	}
	,extractRotation: function(m) {
		var _temp = new phoenix_Vector();
		var me = m.elements;
		var _scale_x = 1 / _temp.set_xyz(me[0],me[1],me[2]).get_length();
		var _scale_y = 1 / _temp.set_xyz(me[4],me[5],me[6]).get_length();
		var _scale_z = 1 / _temp.set_xyz(me[8],me[9],me[10]).get_length();
		this.elements[0] = me[0] * _scale_x;
		this.elements[1] = me[1] * _scale_x;
		this.elements[2] = me[2] * _scale_x;
		this.elements[4] = me[4] * _scale_y;
		this.elements[5] = me[5] * _scale_y;
		this.elements[6] = me[6] * _scale_y;
		this.elements[8] = me[8] * _scale_z;
		this.elements[9] = me[9] * _scale_z;
		this.elements[10] = me[10] * _scale_z;
		return this;
	}
	,makeRotationFromEuler: function(_v,_order) {
		if(_order == null) _order = 0;
		var te = this.elements;
		var x = _v.x;
		var y = _v.y;
		var z = _v.z;
		var a = Math.cos(x);
		var b = Math.sin(x);
		var c = Math.cos(y);
		var d = Math.sin(y);
		var e = Math.cos(z);
		var f = Math.sin(z);
		if(_order == 0) {
			var ae = a * e;
			var af = a * f;
			var be = b * e;
			var bf = b * f;
			te[0] = c * e;
			te[4] = -c * f;
			te[8] = d;
			te[1] = af + be * d;
			te[5] = ae - bf * d;
			te[9] = -b * c;
			te[2] = bf - ae * d;
			te[6] = be + af * d;
			te[10] = a * c;
		} else if(_order == 1) {
			var ce = c * e;
			var cf = c * f;
			var de = d * e;
			var df = d * f;
			te[0] = ce + df * b;
			te[4] = de * b - cf;
			te[8] = a * d;
			te[1] = a * f;
			te[5] = a * e;
			te[9] = -b;
			te[2] = cf * b - de;
			te[6] = df + ce * b;
			te[10] = a * c;
		} else if(_order == 2) {
			var ce1 = c * e;
			var cf1 = c * f;
			var de1 = d * e;
			var df1 = d * f;
			te[0] = ce1 - df1 * b;
			te[4] = -a * f;
			te[8] = de1 + cf1 * b;
			te[1] = cf1 + de1 * b;
			te[5] = a * e;
			te[9] = df1 - ce1 * b;
			te[2] = -a * d;
			te[6] = b;
			te[10] = a * c;
		} else if(_order == 3) {
			var ae1 = a * e;
			var af1 = a * f;
			var be1 = b * e;
			var bf1 = b * f;
			te[0] = c * e;
			te[4] = be1 * d - af1;
			te[8] = ae1 * d + bf1;
			te[1] = c * f;
			te[5] = bf1 * d + ae1;
			te[9] = af1 * d - be1;
			te[2] = -d;
			te[6] = b * c;
			te[10] = a * c;
		} else if(_order == 4) {
			var ac = a * c;
			var ad = a * d;
			var bc = b * c;
			var bd = b * d;
			te[0] = c * e;
			te[4] = bd - ac * f;
			te[8] = bc * f + ad;
			te[1] = f;
			te[5] = a * e;
			te[9] = -b * e;
			te[2] = -d * e;
			te[6] = ad * f + bc;
			te[10] = ac - bd * f;
		} else if(_order == 5) {
			var ac1 = a * c;
			var ad1 = a * d;
			var bc1 = b * c;
			var bd1 = b * d;
			te[0] = c * e;
			te[4] = -f;
			te[8] = d * e;
			te[1] = ac1 * f + bd1;
			te[5] = a * e;
			te[9] = ad1 * f - bc1;
			te[2] = bc1 * f - ad1;
			te[6] = b * e;
			te[10] = bd1 * f + ac1;
		}
		te[3] = 0;
		te[7] = 0;
		te[11] = 0;
		te[12] = 0;
		te[13] = 0;
		te[14] = 0;
		te[15] = 1;
		return this;
	}
	,makeRotationFromQuaternion: function(q) {
		var te = this.elements;
		var x2 = q.x + q.x;
		var y2 = q.y + q.y;
		var z2 = q.z + q.z;
		var xx = q.x * x2;
		var xy = q.x * y2;
		var xz = q.x * z2;
		var yy = q.y * y2;
		var yz = q.y * z2;
		var zz = q.z * z2;
		var wx = q.w * x2;
		var wy = q.w * y2;
		var wz = q.w * z2;
		te[0] = 1 - (yy + zz);
		te[4] = xy - wz;
		te[8] = xz + wy;
		te[1] = xy + wz;
		te[5] = 1 - (xx + zz);
		te[9] = yz - wx;
		te[2] = xz - wy;
		te[6] = yz + wx;
		te[10] = 1 - (xx + yy);
		te[3] = 0;
		te[7] = 0;
		te[11] = 0;
		te[12] = 0;
		te[13] = 0;
		te[14] = 0;
		te[15] = 1;
		return this;
	}
	,lookAt: function(_eye,_target,_up) {
		var _x = new phoenix_Vector();
		var _y = new phoenix_Vector();
		var _z = new phoenix_Vector();
		var te = this.elements;
		_z = new phoenix_Vector(_target.x - _eye.x,_target.y - _eye.y,_target.z - _eye.z).get_normalized();
		if(Math.sqrt(_z.x * _z.x + _z.y * _z.y + _z.z * _z.z) == 0) {
			_z.z = 1;
			if(_z._construct) _z.z; else {
				if(_z.listen_z != null && !_z.ignore_listeners) _z.listen_z(1);
				_z.z;
			}
		}
		_x = new phoenix_Vector(_up.y * _z.z - _up.z * _z.y,_up.z * _z.x - _up.x * _z.z,_up.x * _z.y - _up.y * _z.x).get_normalized();
		if(Math.sqrt(_x.x * _x.x + _x.y * _x.y + _x.z * _x.z) == 0) {
			var _g = _z;
			_g.set_x(_g.x + 0.0001);
			_x = new phoenix_Vector(_up.y * _z.z - _up.z * _z.y,_up.z * _z.x - _up.x * _z.z,_up.x * _z.y - _up.y * _z.x).get_normalized();
		}
		_y = new phoenix_Vector(_z.y * _x.z - _z.z * _x.y,_z.z * _x.x - _z.x * _x.z,_z.x * _x.y - _z.y * _x.x);
		te[0] = _x.x;
		te[4] = _y.x;
		te[8] = _z.x;
		te[1] = _x.y;
		te[5] = _y.y;
		te[9] = _z.y;
		te[2] = _x.z;
		te[6] = _y.z;
		te[10] = _z.z;
		return this;
	}
	,multiply: function(_m) {
		return this.multiplyMatrices(this,_m);
	}
	,multiplyMatrices: function(_a,_b) {
		var ae = _a.elements;
		var be = _b.elements;
		var te = this.elements;
		var a11 = ae[0];
		var a12 = ae[4];
		var a13 = ae[8];
		var a14 = ae[12];
		var a21 = ae[1];
		var a22 = ae[5];
		var a23 = ae[9];
		var a24 = ae[13];
		var a31 = ae[2];
		var a32 = ae[6];
		var a33 = ae[10];
		var a34 = ae[14];
		var a41 = ae[3];
		var a42 = ae[7];
		var a43 = ae[11];
		var a44 = ae[15];
		var b11 = be[0];
		var b12 = be[4];
		var b13 = be[8];
		var b14 = be[12];
		var b21 = be[1];
		var b22 = be[5];
		var b23 = be[9];
		var b24 = be[13];
		var b31 = be[2];
		var b32 = be[6];
		var b33 = be[10];
		var b34 = be[14];
		var b41 = be[3];
		var b42 = be[7];
		var b43 = be[11];
		var b44 = be[15];
		te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
		te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
		te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
		te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
		return this;
	}
	,multiplyToArray: function(_a,_b,_r) {
		var te = this.elements;
		this.multiplyMatrices(_a,_b);
		_r[0] = te[0];
		_r[1] = te[1];
		_r[2] = te[2];
		_r[3] = te[3];
		_r[4] = te[4];
		_r[5] = te[5];
		_r[6] = te[6];
		_r[7] = te[7];
		_r[8] = te[8];
		_r[9] = te[9];
		_r[10] = te[10];
		_r[11] = te[11];
		_r[12] = te[12];
		_r[13] = te[13];
		_r[14] = te[14];
		_r[15] = te[15];
		return this;
	}
	,multiplyScalar: function(_s) {
		var te = this.elements;
		te[0] *= _s;
		te[4] *= _s;
		te[8] *= _s;
		te[12] *= _s;
		te[1] *= _s;
		te[5] *= _s;
		te[9] *= _s;
		te[13] *= _s;
		te[2] *= _s;
		te[6] *= _s;
		te[10] *= _s;
		te[14] *= _s;
		te[3] *= _s;
		te[7] *= _s;
		te[11] *= _s;
		te[15] *= _s;
		return this;
	}
	,multiplyVector3Array: function(_a) {
		var v1 = new phoenix_Vector();
		var i = 0;
		var il = _a.length;
		while(i < il) {
			v1.set_x(_a[i]);
			v1.set_y(_a[i + 1]);
			v1.set_z(_a[i + 2]);
			v1.applyProjection(this);
			_a[i] = v1.x;
			_a[i + 1] = v1.y;
			_a[i + 2] = v1.z;
			i += 3;
		}
		return _a;
	}
	,determinant: function() {
		var te = this.elements;
		var n11 = te[0];
		var n12 = te[4];
		var n13 = te[8];
		var n14 = te[12];
		var n21 = te[1];
		var n22 = te[5];
		var n23 = te[9];
		var n24 = te[13];
		var n31 = te[2];
		var n32 = te[6];
		var n33 = te[10];
		var n34 = te[14];
		var n41 = te[3];
		var n42 = te[7];
		var n43 = te[11];
		var n44 = te[15];
		return n41 * (n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
	}
	,transpose: function() {
		var te = this.elements;
		var tmp;
		tmp = te[1];
		te[1] = te[4];
		te[4] = tmp;
		tmp = te[2];
		te[2] = te[8];
		te[8] = tmp;
		tmp = te[6];
		te[6] = te[9];
		te[9] = tmp;
		tmp = te[3];
		te[3] = te[12];
		te[12] = tmp;
		tmp = te[7];
		te[7] = te[13];
		te[13] = tmp;
		tmp = te[11];
		te[11] = te[14];
		te[14] = tmp;
		return this;
	}
	,flattenToArray: function(_flat) {
		if(_flat == null) {
			_flat = [];
			var _g = 0;
			while(_g < 16) {
				var i = _g++;
				_flat.push(0.0);
			}
		}
		var te = this.elements;
		_flat[0] = te[0];
		_flat[1] = te[1];
		_flat[2] = te[2];
		_flat[3] = te[3];
		_flat[4] = te[4];
		_flat[5] = te[5];
		_flat[6] = te[6];
		_flat[7] = te[7];
		_flat[8] = te[8];
		_flat[9] = te[9];
		_flat[10] = te[10];
		_flat[11] = te[11];
		_flat[12] = te[12];
		_flat[13] = te[13];
		_flat[14] = te[14];
		_flat[15] = te[15];
		return _flat;
	}
	,flattenToArrayOffset: function(_flat,_offset) {
		var te = this.elements;
		_flat[_offset] = te[0];
		_flat[_offset + 1] = te[1];
		_flat[_offset + 2] = te[2];
		_flat[_offset + 3] = te[3];
		_flat[_offset + 4] = te[4];
		_flat[_offset + 5] = te[5];
		_flat[_offset + 6] = te[6];
		_flat[_offset + 7] = te[7];
		_flat[_offset + 8] = te[8];
		_flat[_offset + 9] = te[9];
		_flat[_offset + 10] = te[10];
		_flat[_offset + 11] = te[11];
		_flat[_offset + 12] = te[12];
		_flat[_offset + 13] = te[13];
		_flat[_offset + 14] = te[14];
		_flat[_offset + 15] = te[15];
		return _flat;
	}
	,setPosition: function(_v) {
		var te = this.elements;
		te[12] = _v.x;
		te[13] = _v.y;
		te[14] = _v.z;
		return this;
	}
	,inverse: function() {
		return this.clone().getInverse(this);
	}
	,getInverse: function(_m) {
		var te = this.elements;
		var me = _m.elements;
		var n11 = me[0];
		var n12 = me[4];
		var n13 = me[8];
		var n14 = me[12];
		var n21 = me[1];
		var n22 = me[5];
		var n23 = me[9];
		var n24 = me[13];
		var n31 = me[2];
		var n32 = me[6];
		var n33 = me[10];
		var n34 = me[14];
		var n41 = me[3];
		var n42 = me[7];
		var n43 = me[11];
		var n44 = me[15];
		te[0] = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
		te[4] = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
		te[8] = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
		te[12] = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
		te[1] = n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44;
		te[5] = n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44;
		te[9] = n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44;
		te[13] = n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34;
		te[2] = n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44;
		te[6] = n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44;
		te[10] = n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44;
		te[14] = n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34;
		te[3] = n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43;
		te[7] = n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43;
		te[11] = n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43;
		te[15] = n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33;
		var det = me[0] * te[0] + me[1] * te[4] + me[2] * te[8] + me[3] * te[12];
		if(det == 0) {
			haxe_Log.trace("Matrix.getInverse: cant invert matrix, determinant is 0",{ fileName : "Matrix.hx", lineNumber : 696, className : "phoenix.Matrix", methodName : "getInverse"});
			this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
			this;
			return this;
		}
		this.multiplyScalar(1 / det);
		return this;
	}
	,scale: function(_v) {
		var te = this.elements;
		var _x = _v.x;
		var _y = _v.y;
		var _z = _v.z;
		te[0] *= _x;
		te[4] *= _y;
		te[8] *= _z;
		te[1] *= _x;
		te[5] *= _y;
		te[9] *= _z;
		te[2] *= _x;
		te[6] *= _y;
		te[10] *= _z;
		te[3] *= _x;
		te[7] *= _y;
		te[11] *= _z;
		return this;
	}
	,getMaxScaleOnAxis: function() {
		var te = this.elements;
		var _scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
		var _scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
		var _scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
		return Math.sqrt(Math.max(_scaleXSq,Math.max(_scaleYSq,_scaleZSq)));
	}
	,makeTranslation: function(_x,_y,_z) {
		this.set(1,0,0,_x,0,1,0,_y,0,0,1,_z,0,0,0,1);
		return this;
	}
	,makeRotationX: function(_theta) {
		var _c = Math.cos(_theta);
		var _s = Math.sin(_theta);
		this.set(1,0,0,0,0,_c,-_s,0,0,_s,_c,0,0,0,0,1);
		return this;
	}
	,makeRotationY: function(_theta) {
		var _c = Math.cos(_theta);
		var _s = Math.sin(_theta);
		this.set(_c,0,_s,0,0,1,0,0,-_s,0,_c,0,0,0,0,1);
		return this;
	}
	,makeRotationZ: function(_theta) {
		var _c = Math.cos(_theta);
		var _s = Math.sin(_theta);
		this.set(_c,-_s,0,0,_s,_c,0,0,0,0,1,0,0,0,0,1);
		return this;
	}
	,makeRotationAxis: function(_axis,_angle) {
		var _c = Math.cos(_angle);
		var _s = Math.sin(_angle);
		var _t = 1 - _c;
		var _ax = _axis.x;
		var _ay = _axis.y;
		var _az = _axis.z;
		var _tx = _t * _ax;
		var _ty = _t * _ay;
		this.set(_tx * _ax + _c,_tx * _ay - _s * _az,_tx * _az + _s * _ay,0,_tx * _ay + _s * _az,_ty * _ay + _c,_ty * _az - _s * _ax,0,_tx * _az - _s * _ay,_ty * _az + _s * _ax,_t * _az * _az + _c,0,0,0,0,1);
		return this;
	}
	,makeScale: function(_x,_y,_z) {
		this.set(_x,0,0,0,0,_y,0,0,0,0,_z,0,0,0,0,1);
		return this;
	}
	,compose_with_origin: function(_position,_origin,_quaternion,_scale) {
		this.set(1,0,0,_origin.x,0,1,0,_origin.y,0,0,1,_origin.z,0,0,0,1);
		this;
		this.scale(_scale);
		this.multiply(new phoenix_Matrix().makeRotationFromQuaternion(_quaternion));
		this.multiply(new phoenix_Matrix().makeTranslation(-_origin.x,-_origin.y,-_origin.z));
		this.multiply(new phoenix_Matrix().makeTranslation(_position.x,_position.y,_position.z));
		return this;
	}
	,compose: function(_position,_quaternion,_scale) {
		this.makeRotationFromQuaternion(_quaternion);
		this.scale(_scale);
		this.setPosition(_position);
		return this;
	}
	,decompose: function(_position,_quaternion,_scale) {
		var te = this.elements;
		var matrix = new phoenix_Matrix();
		var _ax_x = te[0];
		var _ax_y = te[1];
		var _ax_z = te[2];
		var _ay_x = te[4];
		var _ay_y = te[5];
		var _ay_z = te[6];
		var _az_x = te[8];
		var _az_y = te[9];
		var _az_z = te[10];
		var _ax_length = Math.sqrt(_ax_x * _ax_x + _ax_y * _ax_y + _ax_z * _ax_z);
		var _ay_length = Math.sqrt(_ay_x * _ay_x + _ay_y * _ay_y + _ay_z * _ay_z);
		var _az_length = Math.sqrt(_az_x * _az_x + _az_y * _az_y + _az_z * _az_z);
		if(_quaternion == null) _quaternion = new phoenix_Quaternion();
		if(_position == null) _position = new phoenix_Vector(te[12],te[13],te[14]); else {
			_position.set_x(te[12]);
			_position.set_y(te[13]);
			_position.set_z(te[14]);
		}
		if(_scale == null) _scale = new phoenix_Vector(_ax_length,_ay_length,_az_length); else {
			_scale.x = _ax_length;
			if(_scale._construct) _scale.x; else {
				if(_scale.listen_x != null && !_scale.ignore_listeners) _scale.listen_x(_ax_length);
				_scale.x;
			}
			_scale.y = _ay_length;
			if(_scale._construct) _scale.y; else {
				if(_scale.listen_y != null && !_scale.ignore_listeners) _scale.listen_y(_ay_length);
				_scale.y;
			}
			_scale.z = _az_length;
			if(_scale._construct) _scale.z; else {
				if(_scale.listen_z != null && !_scale.ignore_listeners) _scale.listen_z(_az_length);
				_scale.z;
			}
		}
		matrix.elements = this.elements.concat([]);
		var me = matrix.elements;
		me[0] /= _ax_length;
		me[1] /= _ax_length;
		me[2] /= _ax_length;
		me[4] /= _ay_length;
		me[5] /= _ay_length;
		me[6] /= _ay_length;
		me[8] /= _az_length;
		me[9] /= _az_length;
		me[10] /= _az_length;
		_quaternion.setFromRotationMatrix(matrix);
		if(this._transform == null) this._transform = new phoenix_MatrixTransform(_position,_quaternion,_scale); else {
			this._transform.pos = _position;
			this._transform.rotation = _quaternion;
			this._transform.scale = _scale;
		}
		return this._transform;
	}
	,makeFrustum: function(_left,_right,_bottom,_top,_near,_far) {
		var te = this.elements;
		var tx = 2 * _near / (_right - _left);
		var ty = 2 * _near / (_top - _bottom);
		var a = (_right + _left) / (_right - _left);
		var b = (_top + _bottom) / (_top - _bottom);
		var c = -(_far + _near) / (_far - _near);
		var d = -2 * _far * _near / (_far - _near);
		te[0] = tx;
		te[4] = 0;
		te[8] = a;
		te[12] = 0;
		te[1] = 0;
		te[5] = ty;
		te[9] = b;
		te[13] = 0;
		te[2] = 0;
		te[6] = 0;
		te[10] = c;
		te[14] = d;
		te[3] = 0;
		te[7] = 0;
		te[11] = -1;
		te[15] = 0;
		return this;
	}
	,makePerspective: function(_fov,_aspect,_near,_far) {
		var ymax = _near * Math.tan(_fov * 0.5 * 0.017453292519943278);
		var ymin = -ymax;
		var xmin = ymin * _aspect;
		var xmax = ymax * _aspect;
		return this.makeFrustum(xmin,xmax,ymin,ymax,_near,_far);
	}
	,makeOrthographic: function(_left,_right,_top,_bottom,_near,_far) {
		var te = this.elements;
		var w = _right - _left;
		var h = _top - _bottom;
		var p = _far - _near;
		var tx = (_right + _left) / w;
		var ty = (_top + _bottom) / h;
		var tz = (_far + _near) / p;
		te[0] = 2 / w;
		te[4] = 0;
		te[8] = 0;
		te[12] = -tx;
		te[1] = 0;
		te[5] = 2 / h;
		te[9] = 0;
		te[13] = -ty;
		te[2] = 0;
		te[6] = 0;
		te[10] = -2 / p;
		te[14] = -tz;
		te[3] = 0;
		te[7] = 0;
		te[11] = 0;
		te[15] = 1;
		return this;
	}
	,fromArray: function(_from) {
		this.elements = _from.concat([]);
	}
	,toArray: function() {
		var te = this.elements;
		return [te[0],te[1],te[2],te[3],te[4],te[5],te[6],te[7],te[8],te[9],te[10],te[11],te[12],te[13],te[14],te[15]];
	}
	,clone: function() {
		var te = this.elements;
		return new phoenix_Matrix(te[0],te[4],te[8],te[12],te[1],te[5],te[9],te[13],te[2],te[6],te[10],te[14],te[3],te[7],te[11],te[15]);
	}
	,up: function() {
		return new phoenix_Vector(this.elements[4],this.elements[5],this.elements[6]);
	}
	,down: function() {
		return new phoenix_Vector(this.elements[4],this.elements[5],this.elements[6]).get_inverted();
	}
	,left: function() {
		return new phoenix_Vector(this.elements[0],this.elements[1],this.elements[2]).get_inverted();
	}
	,right: function() {
		return new phoenix_Vector(this.elements[0],this.elements[1],this.elements[2]);
	}
	,backward: function() {
		return new phoenix_Vector(this.elements[8],this.elements[9],this.elements[10]);
	}
	,forward: function() {
		return new phoenix_Vector(this.elements[8],this.elements[9],this.elements[10]).get_inverted();
	}
	,__class__: phoenix_Matrix
	,__properties__: {set_M44:"set_M44",get_M44:"get_M44",set_M34:"set_M34",get_M34:"get_M34",set_M24:"set_M24",get_M24:"get_M24",set_M14:"set_M14",get_M14:"get_M14",set_M43:"set_M43",get_M43:"get_M43",set_M33:"set_M33",get_M33:"get_M33",set_M23:"set_M23",get_M23:"get_M23",set_M13:"set_M13",get_M13:"get_M13",set_M42:"set_M42",get_M42:"get_M42",set_M32:"set_M32",get_M32:"get_M32",set_M22:"set_M22",get_M22:"get_M22",set_M12:"set_M12",get_M12:"get_M12",set_M41:"set_M41",get_M41:"get_M41",set_M31:"set_M31",get_M31:"get_M31",set_M21:"set_M21",get_M21:"get_M21",set_M11:"set_M11",get_M11:"get_M11"}
};
var phoenix_Quaternion = function(_x,_y,_z,_w) {
	if(_w == null) _w = 1;
	if(_z == null) _z = 0;
	if(_y == null) _y = 0;
	if(_x == null) _x = 0;
	this.ignore_euler = false;
	this._construct = false;
	this.ignore_listeners = false;
	this.w = 0.0;
	this.z = 0.0;
	this.y = 0.0;
	this.x = 0.0;
	this._construct = true;
	this.x = _x;
	if(this._construct) this.x; else {
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		this.x;
	}
	this.y = _y;
	if(this._construct) this.y; else {
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		this.y;
	}
	this.z = _z;
	if(this._construct) this.z; else {
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		this.z;
	}
	this.w = _w;
	if(this._construct) this.w; else {
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
		this.w;
	}
	this.euler = new phoenix_Vector();
	this._construct = false;
};
$hxClasses["phoenix.Quaternion"] = phoenix_Quaternion;
phoenix_Quaternion.__name__ = ["phoenix","Quaternion"];
phoenix_Quaternion.Add = function(_a,_b) {
	return _a.clone().add(_b);
};
phoenix_Quaternion.Multiply = function(_a,_b) {
	return _a.clone().multiply(_b);
};
phoenix_Quaternion.MultiplyScalar = function(_quaternion,_scalar) {
	return _quaternion.clone().multiplyScalar(_scalar);
};
phoenix_Quaternion.Slerp = function(_qa,_qb,_qm,_t) {
	return _qm.copy(_qa).slerp(_qb,_t);
};
phoenix_Quaternion.Dot = function(_a,_b) {
	return new phoenix_Quaternion(_a.x,_a.y,_a.z,_a.w).dot(_b);
};
phoenix_Quaternion.Listen = function(_q,listener) {
	_q.listen_x = listener;
	_q.listen_y = listener;
	_q.listen_z = listener;
	_q.listen_w = listener;
};
phoenix_Quaternion.prototype = {
	toString: function() {
		return "{ x:" + this.x + ", y:" + this.y + ", z:" + this.z + ", w:" + this.w + " }";
	}
	,set: function(_x,_y,_z,_w) {
		this.ignore_euler = true;
		this.x = _x;
		if(this._construct) this.x; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			this.x;
		}
		this.y = _y;
		if(this._construct) this.y; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			this.y;
		}
		this.z = _z;
		if(this._construct) this.z; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			this.z;
		}
		this.w = _w;
		if(this._construct) this.w; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
			this.w;
		}
		this.ignore_euler = false;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
		return this;
	}
	,copy: function(_quaternion) {
		this.ignore_euler = true;
		this.x = _quaternion.x;
		if(this._construct) this.x; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			this.x;
		}
		this.y = _quaternion.y;
		if(this._construct) this.y; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			this.y;
		}
		this.z = _quaternion.z;
		if(this._construct) this.z; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			this.z;
		}
		this.w = _quaternion.w;
		if(this._construct) this.w; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
			this.w;
		}
		this.ignore_euler = false;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
		return this;
	}
	,dot: function(_other) {
		return this.x * _other.x + this.y * _other.y + this.z * _other.z + this.w * _other.w;
	}
	,setFromEuler: function(_euler,_order) {
		if(_order == null) _order = 0;
		var _x = this.x;
		var _y = this.y;
		var _z = this.z;
		var _w = this.w;
		var c1 = Math.cos(_euler.x / 2);
		var c2 = Math.cos(_euler.y / 2);
		var c3 = Math.cos(_euler.z / 2);
		var s1 = Math.sin(_euler.x / 2);
		var s2 = Math.sin(_euler.y / 2);
		var s3 = Math.sin(_euler.z / 2);
		if(_order == 0) {
			_x = s1 * c2 * c3 + c1 * s2 * s3;
			_y = c1 * s2 * c3 - s1 * c2 * s3;
			_z = c1 * c2 * s3 + s1 * s2 * c3;
			_w = c1 * c2 * c3 - s1 * s2 * s3;
		} else if(_order == 1) {
			_x = s1 * c2 * c3 + c1 * s2 * s3;
			_y = c1 * s2 * c3 - s1 * c2 * s3;
			_z = c1 * c2 * s3 - s1 * s2 * c3;
			_w = c1 * c2 * c3 + s1 * s2 * s3;
		} else if(_order == 2) {
			_x = s1 * c2 * c3 - c1 * s2 * s3;
			_y = c1 * s2 * c3 + s1 * c2 * s3;
			_z = c1 * c2 * s3 + s1 * s2 * c3;
			_w = c1 * c2 * c3 - s1 * s2 * s3;
		} else if(_order == 3) {
			_x = s1 * c2 * c3 - c1 * s2 * s3;
			_y = c1 * s2 * c3 + s1 * c2 * s3;
			_z = c1 * c2 * s3 - s1 * s2 * c3;
			_w = c1 * c2 * c3 + s1 * s2 * s3;
		} else if(_order == 4) {
			_x = s1 * c2 * c3 + c1 * s2 * s3;
			_y = c1 * s2 * c3 + s1 * c2 * s3;
			_z = c1 * c2 * s3 - s1 * s2 * c3;
			_w = c1 * c2 * c3 - s1 * s2 * s3;
		} else if(_order == 5) {
			_x = s1 * c2 * c3 - c1 * s2 * s3;
			_y = c1 * s2 * c3 - s1 * c2 * s3;
			_z = c1 * c2 * s3 + s1 * s2 * c3;
			_w = c1 * c2 * c3 + s1 * s2 * s3;
		}
		this.ignore_euler = true;
		this.x = _x;
		if(this._construct) this.x; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			this.x;
		}
		this.y = _y;
		if(this._construct) this.y; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			this.y;
		}
		this.z = _z;
		if(this._construct) this.z; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			this.z;
		}
		this.w = _w;
		if(this._construct) this.w; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
			this.w;
		}
		this.ignore_euler = false;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
		return this;
	}
	,setFromAxisAngle: function(_axis,_angle) {
		var _halfAngle = _angle / 2;
		var _s = Math.sin(_halfAngle);
		this.set_xyzw(_axis.x * _s,_axis.y * _s,_axis.z * _s,Math.cos(_halfAngle));
		return this;
	}
	,setFromRotationMatrix: function(_m) {
		var te = _m.elements;
		var m11 = te[0];
		var m12 = te[4];
		var m13 = te[8];
		var m21 = te[1];
		var m22 = te[5];
		var m23 = te[9];
		var m31 = te[2];
		var m32 = te[6];
		var m33 = te[10];
		var _x = this.x;
		var _y = this.y;
		var _z = this.z;
		var _w = this.w;
		var tr = m11 + m22 + m33;
		var s;
		if(tr > 0) {
			s = 0.5 / Math.sqrt(tr + 1.0);
			_w = 0.25 / s;
			_x = (m32 - m23) * s;
			_y = (m13 - m31) * s;
			_z = (m21 - m12) * s;
		} else if(m11 > m22 && m11 > m33) {
			s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
			_w = (m32 - m23) / s;
			_x = 0.25 * s;
			_y = (m12 + m21) / s;
			_z = (m13 + m31) / s;
		} else if(m22 > m33) {
			s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
			_w = (m13 - m31) / s;
			_x = (m12 + m21) / s;
			_y = 0.25 * s;
			_z = (m23 + m32) / s;
		} else {
			s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
			_w = (m21 - m12) / s;
			_x = (m13 + m31) / s;
			_y = (m23 + m32) / s;
			_z = 0.25 * s;
		}
		this.ignore_euler = true;
		this.x = _x;
		if(this._construct) this.x; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			this.x;
		}
		this.y = _y;
		if(this._construct) this.y; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			this.y;
		}
		this.z = _z;
		if(this._construct) this.z; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			this.z;
		}
		this.w = _w;
		if(this._construct) this.w; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
			this.w;
		}
		this.ignore_euler = false;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
		return this;
	}
	,inverse: function() {
		return this.conjugate().normalize();
	}
	,conjugate: function() {
		this.ignore_euler = true;
		this.x = this.x * -1;
		if(this._construct) this.x; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			this.x;
		}
		this.y = this.y * -1;
		if(this._construct) this.y; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			this.y;
		}
		this.z = this.z * -1;
		if(this._construct) this.z; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			this.z;
		}
		this.ignore_euler = false;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		return this;
	}
	,lengthSq: function() {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	}
	,length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}
	,normalize: function() {
		var l = this.length();
		if(l == 0) {
			this.ignore_euler = true;
			this.x = 0;
			if(this._construct) this.x; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
				this.x;
			}
			this.y = 0;
			if(this._construct) this.y; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
				this.y;
			}
			this.z = 0;
			if(this._construct) this.z; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
				this.z;
			}
			this.w = 1;
			if(this._construct) this.w; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
				this.w;
			}
			this.ignore_euler = false;
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
		} else {
			l = 1 / l;
			this.ignore_euler = true;
			this.x = this.x * l;
			if(this._construct) this.x; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
				this.x;
			}
			this.y = this.y * l;
			if(this._construct) this.y; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
				this.y;
			}
			this.z = this.z * l;
			if(this._construct) this.z; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
				this.z;
			}
			this.w = this.w * l;
			if(this._construct) this.w; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
				this.w;
			}
			this.ignore_euler = false;
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
		}
		return this;
	}
	,multiply: function(_quaternion) {
		return this.multiplyQuaternions(this,_quaternion);
	}
	,add: function(_quaternion) {
		return this.addQuaternions(this,_quaternion);
	}
	,addQuaternions: function(_a,_b) {
		this.x = _a.x + _b.x;
		if(this._construct) this.x; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			this.x;
		}
		this.y = _a.y + _b.y;
		if(this._construct) this.y; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			this.y;
		}
		this.z = _a.z + _b.z;
		if(this._construct) this.z; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			this.z;
		}
		this.w = _a.w + _b.w;
		if(this._construct) this.w; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
			this.w;
		}
		return this;
	}
	,multiplyScalar: function(_scalar) {
		var _g = this;
		_g.x = _g.x * _scalar;
		if(_g._construct) _g.x; else {
			if(_g.euler == null || _g.ignore_euler || _g._construct) null; else _g.euler.setEulerFromQuaternion(_g,null);
			if(_g.listen_x != null && !_g.ignore_listeners) _g.listen_x(_g.x);
			_g.x;
		}
		var _g1 = this;
		_g1.y = _g1.y * _scalar;
		if(_g1._construct) _g1.y; else {
			if(_g1.euler == null || _g1.ignore_euler || _g1._construct) null; else _g1.euler.setEulerFromQuaternion(_g1,null);
			if(_g1.listen_y != null && !_g1.ignore_listeners) _g1.listen_y(_g1.y);
			_g1.y;
		}
		var _g2 = this;
		_g2.z = _g2.z * _scalar;
		if(_g2._construct) _g2.z; else {
			if(_g2.euler == null || _g2.ignore_euler || _g2._construct) null; else _g2.euler.setEulerFromQuaternion(_g2,null);
			if(_g2.listen_z != null && !_g2.ignore_listeners) _g2.listen_z(_g2.z);
			_g2.z;
		}
		var _g3 = this;
		_g3.w = _g3.w * _scalar;
		if(_g3._construct) _g3.w; else {
			if(_g3.euler == null || _g3.ignore_euler || _g3._construct) null; else _g3.euler.setEulerFromQuaternion(_g3,null);
			if(_g3.listen_w != null && !_g3.ignore_listeners) _g3.listen_w(_g3.w);
			_g3.w;
		}
		return this;
	}
	,multiplyQuaternions: function(_a,_b) {
		var qax = _a.x;
		var qay = _a.y;
		var qaz = _a.z;
		var qaw = _a.w;
		var qbx = _b.x;
		var qby = _b.y;
		var qbz = _b.z;
		var qbw = _b.w;
		this.ignore_euler = true;
		this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		if(this._construct) this.x; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			this.x;
		}
		this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		if(this._construct) this.y; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			this.y;
		}
		this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		if(this._construct) this.z; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			this.z;
		}
		this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
		if(this._construct) this.w; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
			this.w;
		}
		this.ignore_euler = false;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
		return this;
	}
	,slerp: function(_qb,_t) {
		var _x = this.x;
		var _y = this.y;
		var _z = this.z;
		var _w = this.w;
		var cosHalfTheta = _w * _qb.w + _x * _qb.x + _y * _qb.y + _z * _qb.z;
		if(cosHalfTheta < 0) {
			this.w = -_qb.w;
			if(this._construct) this.w; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
				this.w;
			}
			this.x = -_qb.x;
			if(this._construct) this.x; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
				this.x;
			}
			this.y = -_qb.y;
			if(this._construct) this.y; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
				this.y;
			}
			this.z = -_qb.z;
			if(this._construct) this.z; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
				this.z;
			}
			cosHalfTheta = -cosHalfTheta;
		} else this.copy(_qb);
		if(cosHalfTheta >= 1.0) {
			this.ignore_euler = true;
			this.x = _x;
			if(this._construct) this.x; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
				this.x;
			}
			this.y = _y;
			if(this._construct) this.y; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
				this.y;
			}
			this.z = _z;
			if(this._construct) this.z; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
				this.z;
			}
			this.w = _w;
			if(this._construct) this.w; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
				this.w;
			}
			this.ignore_euler = false;
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
			return this;
		}
		var halfTheta = Math.acos(cosHalfTheta);
		var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
		if(Math.abs(sinHalfTheta) < 0.001) {
			this.ignore_euler = true;
			this.x = 0.5 * (_w + this.w);
			if(this._construct) this.x; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
				this.x;
			}
			this.y = 0.5 * (_x + this.x);
			if(this._construct) this.y; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
				this.y;
			}
			this.z = 0.5 * (_y + this.y);
			if(this._construct) this.z; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
				this.z;
			}
			this.w = 0.5 * (_z + this.z);
			if(this._construct) this.w; else {
				if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
				if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
				this.w;
			}
			this.ignore_euler = false;
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
			return this;
		}
		var ratioA = Math.sin((1 - _t) * halfTheta) / sinHalfTheta;
		var ratioB = Math.sin(_t * halfTheta) / sinHalfTheta;
		this.ignore_euler = true;
		this.x = _w * ratioA + this.w * ratioB;
		if(this._construct) this.x; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			this.x;
		}
		this.y = _x * ratioA + this.x * ratioB;
		if(this._construct) this.y; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			this.y;
		}
		this.z = _y * ratioA + this.y * ratioB;
		if(this._construct) this.z; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			this.z;
		}
		this.w = _z * ratioA + this.z * ratioB;
		if(this._construct) this.w; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
			this.w;
		}
		this.ignore_euler = false;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
		return this;
	}
	,equals: function(_q) {
		return _q.x == this.x && _q.y == this.y && _q.z == this.z && _q.w == this.w;
	}
	,fromArray: function(_a) {
		this.ignore_euler = true;
		this.x = _a[0];
		if(this._construct) this.x; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			this.x;
		}
		this.y = _a[1];
		if(this._construct) this.y; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			this.y;
		}
		this.z = _a[2];
		if(this._construct) this.z; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			this.z;
		}
		this.w = _a[3];
		if(this._construct) this.w; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
			this.w;
		}
		this.ignore_euler = false;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
		return this;
	}
	,toArray: function() {
		return [this.x,this.y,this.z,this.w];
	}
	,clone: function() {
		return new phoenix_Quaternion(this.x,this.y,this.z,this.w);
	}
	,toeuler: function() {
		return new phoenix_Vector().setEulerFromQuaternion(this,null).degrees();
	}
	,update_euler: function() {
		if(this.euler == null || this.ignore_euler || this._construct) return;
		this.euler.setEulerFromQuaternion(this,null);
	}
	,set_xyzw: function(_x,_y,_z,_w) {
		this.ignore_euler = true;
		this.x = _x;
		if(this._construct) this.x; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			this.x;
		}
		this.y = _y;
		if(this._construct) this.y; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			this.y;
		}
		this.z = _z;
		if(this._construct) this.z; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			this.z;
		}
		this.w = _w;
		if(this._construct) this.w; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
			this.w;
		}
		this.ignore_euler = false;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
	}
	,set_xyz: function(_x,_y,_z) {
		this.ignore_euler = true;
		this.x = _x;
		if(this._construct) this.x; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
			this.x;
		}
		this.y = _y;
		if(this._construct) this.y; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
			this.y;
		}
		this.z = _z;
		if(this._construct) this.z; else {
			if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
			this.z;
		}
		this.ignore_euler = false;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
	}
	,set_x: function(_v) {
		this.x = _v;
		if(this._construct) return this.x;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		return this.x;
	}
	,set_y: function(_v) {
		this.y = _v;
		if(this._construct) return this.y;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		return this.y;
	}
	,set_z: function(_v) {
		this.z = _v;
		if(this._construct) return this.z;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		return this.z;
	}
	,set_w: function(_v) {
		this.w = _v;
		if(this._construct) return this.w;
		if(this.euler == null || this.ignore_euler || this._construct) null; else this.euler.setEulerFromQuaternion(this,null);
		if(this.listen_w != null && !this.ignore_listeners) this.listen_w(this.w);
		return this.w;
	}
	,__class__: phoenix_Quaternion
	,__properties__: {set_w:"set_w",set_z:"set_z",set_y:"set_y",set_x:"set_x"}
};
var phoenix_Ray = function(_screen_pos,_camera,_viewport) {
	if(_viewport == null) _viewport = new phoenix_Rectangle(0,0,Luxe.core.screen.get_w(),Luxe.core.screen.get_h());
	if(_camera == null) throw new js__$Boot_HaxeError("Camera required for a ray!");
	this.camera = _camera;
	this.viewport = _viewport;
	this.refresh(_screen_pos);
};
$hxClasses["phoenix.Ray"] = phoenix_Ray;
phoenix_Ray.__name__ = ["phoenix","Ray"];
phoenix_Ray.prototype = {
	refresh: function(_screen_pos) {
		var ndc_x = (_screen_pos.x / this.viewport.w - 0.5) * 2.0;
		var ndc_y = ((this.viewport.h - _screen_pos.y) / this.viewport.h - 0.5) * 2.0;
		var start_ndc = new phoenix_Vector(ndc_x,ndc_y,0.0,1.0);
		var end_ndc = new phoenix_Vector(ndc_x,ndc_y,1.0,1.0);
		this.origin = this.camera.unproject(start_ndc);
		this.end = this.camera.unproject(end_ndc);
		this.dir = phoenix_Vector.Subtract(this.end,this.origin);
	}
	,__class__: phoenix_Ray
};
var phoenix_Rectangle = function(_x,_y,_w,_h) {
	if(_h == null) _h = 0;
	if(_w == null) _w = 0;
	if(_y == null) _y = 0;
	if(_x == null) _x = 0;
	this.ignore_listeners = false;
	this.h = 0;
	this.w = 0;
	this.y = 0;
	this.x = 0;
	this.set_x(_x);
	this.set_y(_y);
	this.set_w(_w);
	this.set_h(_h);
};
$hxClasses["phoenix.Rectangle"] = phoenix_Rectangle;
phoenix_Rectangle.__name__ = ["phoenix","Rectangle"];
phoenix_Rectangle.listen = function(_r,listener) {
	_r.listen_x = listener;
	_r.listen_y = listener;
	_r.listen_w = listener;
	_r.listen_h = listener;
};
phoenix_Rectangle.prototype = {
	toString: function() {
		return "{ x:" + this.x + ", y:" + this.y + ", w:" + this.w + ", h:" + this.h + " }";
	}
	,point_inside: function(_p) {
		if(_p.x < this.x) return false;
		if(_p.y < this.y) return false;
		if(_p.x > this.x + this.w) return false;
		if(_p.y > this.y + this.h) return false;
		return true;
	}
	,overlaps: function(_other) {
		if(_other == null) return false;
		if(this.x < _other.x + _other.w && this.y < _other.y + _other.h && this.x + this.w > _other.x && this.y + this.h > _other.y) return true;
		return false;
	}
	,clone: function() {
		return new phoenix_Rectangle(this.x,this.y,this.w,this.h);
	}
	,equal: function(_other) {
		if(_other == null) return false;
		return this.x == _other.x && this.y == _other.y && this.w == _other.w && this.h == _other.h;
	}
	,copy_from: function(_rect) {
		this.set_x(_rect.x);
		this.set_y(_rect.y);
		this.set_w(_rect.w);
		this.set_h(_rect.h);
	}
	,set: function(_x,_y,_w,_h) {
		var _setx = this.x;
		var _sety = this.y;
		var _setw = this.w;
		var _seth = this.h;
		if(_x != null) _setx = _x;
		if(_y != null) _sety = _y;
		if(_w != null) _setw = _w;
		if(_h != null) _seth = _h;
		this.set_x(_setx);
		this.set_y(_sety);
		this.set_w(_setw);
		this.set_h(_seth);
		return this;
	}
	,set_x: function(_x) {
		this.x = _x;
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(_x);
		return this.x;
	}
	,set_y: function(_y) {
		this.y = _y;
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(_y);
		return this.y;
	}
	,set_w: function(_w) {
		this.w = _w;
		if(this.listen_w != null && !this.ignore_listeners) this.listen_w(_w);
		return this.w;
	}
	,set_h: function(_h) {
		this.h = _h;
		if(this.listen_h != null && !this.ignore_listeners) this.listen_h(_h);
		return this.h;
	}
	,__class__: phoenix_Rectangle
	,__properties__: {set_h:"set_h",set_w:"set_w",set_y:"set_y",set_x:"set_x"}
};
var phoenix_RenderPath = function(_renderer) {
	this.renderer = _renderer;
};
$hxClasses["phoenix.RenderPath"] = phoenix_RenderPath;
phoenix_RenderPath.__name__ = ["phoenix","RenderPath"];
phoenix_RenderPath.prototype = {
	render: function(_batchers,_stats) {
		var c = _batchers.length;
		var i = 0;
		while(i < c) {
			var batch = _batchers[i];
			if(batch.enabled) {
				Luxe.debug.start("batch." + batch.name);
				batch.draw_calls = 0;
				batch.vert_count = 0;
				batch.emitter.emit(1,batch);
				batch.view.process();
				batch.renderer.state.viewport(batch.view.viewport.x,batch.view.viewport.y,batch.view.viewport.w,batch.view.viewport.h);
				batch.batch(false);
				batch.emitter.emit(2,batch);
				_stats.geometry_count += batch.geometry.size();
				_stats.dynamic_batched_count += batch.dynamic_batched_count;
				_stats.static_batched_count += batch.static_batched_count;
				_stats.visible_count += batch.visible_count;
				_stats.draw_calls += batch.draw_calls;
				_stats.vert_count += batch.vert_count;
				Luxe.debug.end("batch." + batch.name);
			}
			batch = null;
			++i;
		}
	}
	,__class__: phoenix_RenderPath
};
var phoenix_RenderState = function(_renderer) {
	this._last_depth_mask = true;
	this._last_line_width = 1;
	this._active_texture = -1;
	this._used_program = null;
	this._current_rbo = null;
	this._current_fbo = null;
	this.depth_func = -1;
	this._view_target_h = 0.0;
	this.depth_mask = true;
	this.depth_test = false;
	this.cull_face = false;
	this.renderer = _renderer;
	this._viewport = new phoenix_Rectangle(0,0,0,0);
};
$hxClasses["phoenix.RenderState"] = phoenix_RenderState;
phoenix_RenderState.__name__ = ["phoenix","RenderState"];
phoenix_RenderState.prototype = {
	enable: function(what) {
		switch(what) {
		case 2884:
			if(!this.cull_face) {
				this.cull_face = true;
				snow_modules_opengl_web_GL.gl.enable(2884);
			}
			break;
		case 2929:
			if(Luxe.core.app.config.render.depth > 0) {
				if(!this.depth_test) {
					this.depth_test = true;
					snow_modules_opengl_web_GL.gl.enable(2929);
				}
			}
			break;
		}
	}
	,disable: function(what) {
		switch(what) {
		case 2884:
			if(this.cull_face) {
				this.cull_face = false;
				snow_modules_opengl_web_GL.gl.disable(2884);
			}
			break;
		case 2929:
			if(Luxe.core.app.config.render.depth > 0) {
				if(this.depth_test) {
					this.depth_test = false;
					snow_modules_opengl_web_GL.gl.disable(2929);
				}
			}
			break;
		}
	}
	,depth_function: function(what) {
		if(this.depth_func != what) {
			snow_modules_opengl_web_GL.gl.depthFunc(what);
			this.depth_func = what;
		}
	}
	,viewport: function(x,y,w,h) {
		var _target_h = this.renderer.target_size.y;
		if(this._viewport.x != x || this._viewport.y != y || this._viewport.w != w || this._viewport.h != h || this._view_target_h != _target_h) {
			this._viewport.set_x(x);
			this._viewport.set_y(y);
			this._viewport.set_w(w);
			this._viewport.set_h(h);
			this._view_target_h = _target_h;
			var _y = _target_h - (y + h);
			snow_modules_opengl_web_GL.gl.viewport(x | 0,_y | 0,w | 0,h | 0);
		}
	}
	,bindFramebuffer: function(buffer) {
		if(this._current_fbo != buffer) {
			if(buffer == null) buffer = this.renderer.default_fbo;
			buffer;
			snow_modules_opengl_web_GL.gl.bindFramebuffer(36160,buffer);
			this._current_fbo = buffer;
		}
	}
	,bindRenderbuffer: function(buffer) {
		if(this._current_rbo != buffer) {
			if(buffer == null) buffer = this.renderer.default_rbo;
			buffer;
			snow_modules_opengl_web_GL.gl.bindRenderbuffer(36161,buffer);
			this._current_rbo = buffer;
		}
	}
	,useProgram: function(program) {
		if(this._used_program != program) {
			this._used_program = program;
			snow_modules_opengl_web_GL.gl.useProgram(program);
		}
	}
	,activeTexture: function(val) {
		if(this._active_texture != val) {
			snow_modules_opengl_web_GL.gl.activeTexture(val);
			this._active_texture = val;
		}
	}
	,bindTexture: function(type,tex) {
		switch(type) {
		case 3553:
			this.bindTexture2D(tex);
			break;
		case 34067:
			this.bindTextureCube(tex);
			break;
		}
	}
	,bindTexture2D: function(tex) {
		if(phoenix_RenderState.bound_texture_2D != tex) {
			phoenix_RenderState.bound_texture_2D = tex;
			snow_modules_opengl_web_GL.gl.bindTexture(3553,tex);
		}
	}
	,bindTextureCube: function(tex) {
		if(phoenix_RenderState.bound_texture_cube != tex) {
			phoenix_RenderState.bound_texture_cube = tex;
			snow_modules_opengl_web_GL.gl.bindTexture(34067,tex);
		}
	}
	,lineWidth: function(_width) {
		if(this._last_line_width != _width) {
			this._last_line_width = _width;
			snow_modules_opengl_web_GL.gl.lineWidth(_width);
		}
	}
	,depthMask: function(_enable) {
		if(this._last_depth_mask != _enable) {
			this._last_depth_mask = _enable;
			snow_modules_opengl_web_GL.gl.depthMask(_enable);
		}
	}
	,__class__: phoenix_RenderState
};
var phoenix_Texture = function(_options) {
	this.load_premultiply_alpha = false;
	this.height = -1;
	this.width = -1;
	this.height_actual = -1;
	this.width_actual = -1;
	this.compressed = false;
	this.border = 0;
	this.slot = 0;
	if(_options == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options was null" + (" ( " + "Texture create requires non-null options" + " )")));
	if(_options.resource_type == null) _options.resource_type = 4;
	_options.resource_type;
	luxe_resource_Resource.call(this,_options);
	if(_options.texture == null) _options.texture = this.create_texture_id();
	_options.texture;
	this.texture = _options.texture;
	this.bind();
	this.apply_default_options(_options);
	if(_options.pixels != null) {
		if(_options.width == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options.width was null" + (" ( " + "Texture create with pixels requires both width and height" + " )")));
		if(_options.height == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options.height was null" + (" ( " + "Texture create with pixels requires both width and height" + " )")));
	}
	if(_options.width != null || _options.height != null) {
		if(_options.height == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options.height was null" + (" ( " + "Texture requires both width and height, only width was given in construct options" + " )")));
		if(_options.width == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options.width was null" + (" ( " + "Texture requires both width and height, only height was given in construct options" + " )")));
		this.width = this.width_actual = _options.width;
		this.height = this.height_actual = _options.height;
		if(_options.pixels != null) this.submit(_options.pixels);
	}
};
$hxClasses["phoenix.Texture"] = phoenix_Texture;
phoenix_Texture.__name__ = ["phoenix","Texture"];
phoenix_Texture.max_size = function() {
	return snow_modules_opengl_web_GL.gl.getParameter(3379);
};
phoenix_Texture.dump_asset_info = function(_asset) {
	null;
};
phoenix_Texture.type_name = function(_type) {
	switch(_type) {
	case 3553:
		return "tex_2D";
	case 34067:
		return "tex_cube";
	}
};
phoenix_Texture.filter_name = function(_filter) {
	switch(_filter) {
	case 9729:
		return "linear";
	case 9728:
		return "nearest";
	case 9987:
		return "mip_linear_linear";
	case 9985:
		return "mip_linear_nearest";
	case 9986:
		return "mip_nearest_linear";
	case 9984:
		return "mip_nearest_nearest";
	}
};
phoenix_Texture.clamp_name = function(_clamp) {
	switch(_clamp) {
	case 33071:
		return "edge";
	case 10497:
		return "repeat";
	case 33648:
		return "mirror";
	}
};
phoenix_Texture.__super__ = luxe_resource_Resource;
phoenix_Texture.prototype = $extend(luxe_resource_Resource.prototype,{
	memory_use: function() {
		return this.width_actual * this.height_actual * 4;
	}
	,fetch: function(_into,_x,_y,_w,_h) {
		if(_y == null) _y = 0;
		if(_x == null) _x = 0;
		if(_into == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_into was null" + (" ( " + "Texture fetch requires a valid buffer to store the pixels." + " )")));
		if(_x == null) _x = 0;
		_x;
		if(_y == null) _y = 0;
		_y;
		if(_w == null) _w = this.width;
		_w;
		if(_h == null) _h = this.height;
		_h;
		var _required = _w * _h * 4;
		if(!(_into.length >= _required)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_into.length >= _required" + (" ( " + ("Texture fetch requires at least " + _required + " (w * h * 4) bytes for the pixels, you have " + _into.length + "!") + " )")));
		var fb = snow_modules_opengl_web_GL.gl.createFramebuffer();
		snow_modules_opengl_web_GL.gl.bindFramebuffer(36160,fb);
		snow_modules_opengl_web_GL.gl.framebufferTexture2D(36160,36064,3553,this.texture,0);
		if(!(snow_modules_opengl_web_GL.gl.checkFramebufferStatus(36160) == 36053)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("GL.checkFramebufferStatus(GL.FRAMEBUFFER) == GL.FRAMEBUFFER_COMPLETE" + ""));
		snow_modules_opengl_web_GL.gl.readPixels(_x,_y,_w,_h,6408,5121,_into);
		snow_modules_opengl_web_GL.gl.bindFramebuffer(36160,null);
		snow_modules_opengl_web_GL.gl.deleteFramebuffer(fb);
		fb = null;
		return _into;
	}
	,submit: function(_pixels,_target,_level) {
		if(_level == null) _level = 0;
		if(!(_level >= 0)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_level >= 0" + (" ( " + "Texture submit level cannot be negative" + " )")));
		var _max = phoenix_Texture.max_size();
		if(!(this.width_actual <= _max)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("width_actual <= _max" + (" ( " + ("Texture actual width bigger than maximum hardware size (width:" + this.width_actual + ", max:" + _max + ")") + " )")));
		if(!(this.height_actual <= _max)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("height_actual <= _max" + (" ( " + ("Texture actual height bigger than maximum hardware size (height:" + this.height_actual + ", max:" + _max + ")") + " )")));
		this.bind();
		if(this.type == 3553) {
			if(_target == null) _target = 3553;
			_target;
		} else if(_target == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_target was null" + (" ( " + "Texture submit to a non 2D texture requires the _target to be specified" + " )")));
		if(this.compressed) snow_modules_opengl_web_GL.gl.compressedTexImage2D(_target,_level,this.format,this.width_actual,this.height_actual,this.border,_pixels); else snow_modules_opengl_web_GL.gl.texImage2D(_target,_level,this.format,this.width_actual,this.height_actual,this.border,this.format,this.data_type,_pixels);
	}
	,generate_mipmaps: function() {
		this.bind();
		snow_modules_opengl_web_GL.gl.generateMipmap(this.type);
	}
	,bind: function() {
		Luxe.renderer.state.activeTexture(33984 + this.slot);
		Luxe.renderer.state.bindTexture(this.type,this.texture);
	}
	,reload: function() {
		var _g = this;
		if(!(this.state != 6)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("state != ResourceState.destroyed" + (" ( " + "Resource cannot reload when already destroyed" + " )")));
		this.clear();
		return new snow_api_Promise(function(resolve,reject) {
			_g.set_state(2);
			var get = snow_systems_assets_AssetImage.load(Luxe.core.app.assets,_g.id);
			get.then(function(_asset) {
				_g.texture = _g.create_texture_id();
				_g.from_asset(_asset);
				_g.set_state(3);
				resolve(_g);
			});
			get.error(function(_error) {
				_g.set_state(4);
				reject(_error);
			});
		});
	}
	,from_asset: function(_asset,_clear_asset) {
		if(_clear_asset == null) _clear_asset = true;
		this.width = _asset.image.width;
		this.height = _asset.image.height;
		this.width_actual = _asset.image.width_actual;
		this.height_actual = _asset.image.height_actual;
		if(this.load_premultiply_alpha) Luxe.utils.premultiply_alpha(_asset.image.pixels);
		this.submit(_asset.image.pixels);
		if(_clear_asset) {
			_asset.image.pixels = null;
			_asset = null;
		}
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10241,this.filter_min);
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10240,this.filter_mag);
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10242,this.clamp_s);
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10243,this.clamp_t);
	}
	,clear: function() {
		if(this.texture != null) snow_modules_opengl_web_GL.gl.deleteTexture(this.texture);
	}
	,create_texture_id: function() {
		return snow_modules_opengl_web_GL.gl.createTexture();
	}
	,apply_props: function() {
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10241,this.filter_min);
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10240,this.filter_mag);
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10242,this.clamp_s);
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10243,this.clamp_t);
	}
	,apply_default_options: function(_options) {
		if(_options.load_premultiply_alpha == null) _options.load_premultiply_alpha = false;
		this.load_premultiply_alpha = _options.load_premultiply_alpha;
		if(_options.compressed == null) _options.compressed = false;
		this.compressed = _options.compressed;
		if(_options.format == null) _options.format = 6408;
		this.format = _options.format;
		if(_options.type == null) _options.type = 3553;
		this.type = _options.type;
		if(_options.data_type == null) _options.data_type = 5121;
		this.data_type = _options.data_type;
		this.set_filter_min((function($this) {
			var $r;
			if(_options.filter_min == null) _options.filter_min = phoenix_Texture.default_filter;
			$r = _options.filter_min;
			return $r;
		}(this)));
		this.set_filter_mag((function($this) {
			var $r;
			if(_options.filter_mag == null) _options.filter_mag = phoenix_Texture.default_filter;
			$r = _options.filter_mag;
			return $r;
		}(this)));
		this.set_clamp_s((function($this) {
			var $r;
			if(_options.clamp_s == null) _options.clamp_s = phoenix_Texture.default_clamp;
			$r = _options.clamp_s;
			return $r;
		}(this)));
		this.set_clamp_t((function($this) {
			var $r;
			if(_options.clamp_t == null) _options.clamp_t = phoenix_Texture.default_clamp;
			$r = _options.clamp_t;
			return $r;
		}(this)));
	}
	,set_clamp_s: function(_clamp) {
		this.bind();
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10242,_clamp);
		return this.clamp_s = _clamp;
	}
	,set_clamp_t: function(_clamp) {
		this.bind();
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10243,_clamp);
		return this.clamp_t = _clamp;
	}
	,set_filter_min: function(_filter) {
		this.bind();
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10241,_filter);
		return this.filter_min = _filter;
	}
	,set_filter_mag: function(_filter) {
		this.bind();
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,10240,_filter);
		return this.filter_mag = _filter;
	}
	,apply_clamp: function(_clamp,_type) {
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,_type,_clamp);
	}
	,apply_filter: function(_filter,_type) {
		snow_modules_opengl_web_GL.gl.texParameteri(this.type,_type,_filter);
	}
	,toString: function() {
		var _type = phoenix_Texture.type_name(this.type);
		var _filter_min = phoenix_Texture.filter_name(this.filter_min);
		var _filter_mag = phoenix_Texture.filter_name(this.filter_mag);
		var _clamp_s = phoenix_Texture.clamp_name(this.clamp_s);
		var _clamp_t = phoenix_Texture.clamp_name(this.clamp_t);
		var _filter = "filter(min: " + _filter_min + ", mag:" + _filter_mag + ")";
		var _clamp = "clamp(s: " + _clamp_t + ", t: " + _clamp_t + ")";
		var _width = "size(size: " + this.width + "x" + this.height + ", actual: " + this.width_actual + "x" + this.height_actual + ")";
		return "Texture(id: " + this.id + ", tex: " + Std.string(this.texture) + ", type:" + _type + ", " + _width + " " + _filter + " " + _clamp + " )";
	}
	,__class__: phoenix_Texture
	,__properties__: $extend(luxe_resource_Resource.prototype.__properties__,{set_clamp_t:"set_clamp_t",set_clamp_s:"set_clamp_s",set_filter_mag:"set_filter_mag",set_filter_min:"set_filter_min"})
});
var phoenix_RenderTexture = function(_options) {
	_options.resource_type = 5;
	phoenix_Texture.call(this,_options);
	if(_options.width == null) _options.width = Std["int"](Luxe.core.screen.get_w());
	_options.width;
	if(_options.height == null) _options.height = Std["int"](Luxe.core.screen.get_h());
	_options.height;
	this.width = this.width_actual = _options.width;
	this.height = this.height_actual = _options.height;
	if(_options.texture != null) this.submit(null);
	snow_modules_opengl_web_GL.gl.texParameteri(this.type,10241,this.filter_min);
	snow_modules_opengl_web_GL.gl.texParameteri(this.type,10240,this.filter_mag);
	snow_modules_opengl_web_GL.gl.texParameteri(this.type,10242,this.clamp_s);
	snow_modules_opengl_web_GL.gl.texParameteri(this.type,10243,this.clamp_t);
	this.fbo = snow_modules_opengl_web_GL.gl.createFramebuffer();
	this.bindBuffer();
	this.renderbuffer = snow_modules_opengl_web_GL.gl.createRenderbuffer();
	this.bindRenderBuffer();
	snow_modules_opengl_web_GL.gl.renderbufferStorage(36161,33189,this.width,this.height);
	snow_modules_opengl_web_GL.gl.framebufferTexture2D(36160,36064,3553,this.texture,0);
	snow_modules_opengl_web_GL.gl.framebufferRenderbuffer(36160,36096,36161,this.renderbuffer);
	var status = snow_modules_opengl_web_GL.gl.checkFramebufferStatus(36160);
	switch(status) {
	case 36053:
		break;
	case 36054:
		throw new js__$Boot_HaxeError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
		break;
	case 36055:
		throw new js__$Boot_HaxeError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
		break;
	case 36057:
		throw new js__$Boot_HaxeError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
		break;
	case 36061:
		throw new js__$Boot_HaxeError("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
		break;
	default:
		throw new js__$Boot_HaxeError("Incomplete framebuffer: " + status);
	}
	this.unbindBuffer();
	this.unbindRenderBuffer();
	this.system.add(this);
};
$hxClasses["phoenix.RenderTexture"] = phoenix_RenderTexture;
phoenix_RenderTexture.__name__ = ["phoenix","RenderTexture"];
phoenix_RenderTexture.__super__ = phoenix_Texture;
phoenix_RenderTexture.prototype = $extend(phoenix_Texture.prototype,{
	clear: function() {
		phoenix_Texture.prototype.clear.call(this);
		if(this.fbo != null) snow_modules_opengl_web_GL.gl.deleteFramebuffer(this.fbo);
		if(this.renderbuffer != null) snow_modules_opengl_web_GL.gl.deleteRenderbuffer(this.renderbuffer);
	}
	,bindBuffer: function() {
		Luxe.renderer.state.bindFramebuffer(this.fbo);
	}
	,unbindBuffer: function(_other) {
		Luxe.renderer.state.bindFramebuffer(_other);
	}
	,bindRenderBuffer: function() {
		Luxe.renderer.state.bindRenderbuffer(this.renderbuffer);
	}
	,unbindRenderBuffer: function(_other) {
		Luxe.renderer.state.bindRenderbuffer(_other);
	}
	,__class__: phoenix_RenderTexture
});
var phoenix_Renderer = function(_core,_asset) {
	this.stop_count = 0;
	this.stop = false;
	this.should_clear = true;
	this.core = _core;
	this.font_asset = _asset;
	this.default_fbo = snow_modules_opengl_web_GL.gl.getParameter(36006);
	this.default_rbo = snow_modules_opengl_web_GL.gl.getParameter(36007);
	null;
};
$hxClasses["phoenix.Renderer"] = phoenix_Renderer;
phoenix_Renderer.__name__ = ["phoenix","Renderer"];
phoenix_Renderer.prototype = {
	init: function() {
		this.state = new phoenix_RenderState(this);
		this.clear_color = new phoenix_Color().rgb(1710618);
		this.stats = new phoenix_RendererStats();
		this.batchers = [];
		this.target_size = new phoenix_Vector(Luxe.core.screen.get_w(),Luxe.core.screen.get_h());
		this.camera = new phoenix_Camera();
		this.default_render_path = new phoenix_RenderPath(this);
		this.render_path = this.default_render_path;
		this.create_default_shaders();
		this.batcher = new phoenix_Batcher(this,"default batcher");
		this.batcher.set_layer(1);
		this.add_batch(this.batcher);
		this.create_default_font();
		if(Luxe.core.app.config.render.depth > 0) {
			this.state.enable(2929);
			this.state.depth_function(515);
			snow_modules_opengl_web_GL.gl.clearDepth(1.0);
		}
		snow_modules_opengl_web_GL.gl.enable(3042);
		snow_modules_opengl_web_GL.gl.blendFunc(770,771);
		snow_modules_opengl_web_GL.gl.pixelStorei(37441,0);
	}
	,destroy: function() {
		this.clear(new phoenix_Color().rgb(16729099));
	}
	,sort_batchers: function(a,b) {
		if(a.layer < b.layer) return -1;
		if(a.layer > b.layer) return 1;
		if(a.sequence < b.sequence) return -1;
		if(a.sequence > b.sequence) return 1;
		return 1;
	}
	,add_batch: function(batch) {
		this.batchers.push(batch);
		this.batchers.sort($bind(this,this.sort_batchers));
	}
	,remove_batch: function(batch) {
		HxOverrides.remove(this.batchers,batch);
	}
	,create_batcher: function(options) {
		var _new_batcher_layer = 2;
		if(options != null) {
			if(options.name == null) options.name = "batcher";
			options.name;
			if(options.layer == null) options.layer = _new_batcher_layer;
			options.layer;
			if(options.camera == null) options.camera = new phoenix_Camera();
			options.camera;
			if(options.max_verts == null) options.max_verts = 16384;
			options.max_verts;
		} else options = { name : "batcher", camera : new phoenix_Camera(), layer : _new_batcher_layer, max_verts : 16384};
		var _batcher = new phoenix_Batcher(this,options.name,options.max_verts);
		_batcher.view = options.camera;
		_batcher.layer = options.layer;
		_batcher.renderer.batchers.sort(($_=_batcher.renderer,$bind($_,$_.sort_batchers)));
		_batcher.layer;
		if(options.no_add == null || options.no_add == false) this.add_batch(_batcher);
		return _batcher;
	}
	,clear: function(_color) {
		if(_color == null) _color = this.clear_color;
		_color;
		snow_modules_opengl_web_GL.gl.clearColor(_color.r,_color.g,_color.b,_color.a);
		if(Luxe.core.app.config.render.depth > 0) {
			snow_modules_opengl_web_GL.gl.clear(16640);
			snow_modules_opengl_web_GL.gl.clearDepth(1.0);
		} else snow_modules_opengl_web_GL.gl.clear(16384);
	}
	,blend_mode: function(_src_mode,_dst_mode) {
		if(_dst_mode == null) _dst_mode = 771;
		if(_src_mode == null) _src_mode = 770;
		snow_modules_opengl_web_GL.gl.blendFunc(_src_mode,_dst_mode);
	}
	,blend_equation: function(_equation) {
		if(_equation == null) _equation = 32774;
		snow_modules_opengl_web_GL.gl.blendEquation(_equation);
	}
	,internal_resized: function(_w,_h) {
		if(this.get_target() == null) this.target_size.set_xy(_w,_h);
	}
	,process: function() {
		if(this.stop) return;
		if(this.should_clear) this.clear(this.clear_color);
		this.stats.batchers = this.batchers.length;
		this.stats.reset();
		this.render_path.render(this.batchers,this.stats);
	}
	,onresize: function(e) {
	}
	,get_target: function() {
		return this.target;
	}
	,set_target: function(_target) {
		if(_target != null) {
			this.target_size.set_x(_target.width);
			this.target_size.set_y(_target.height);
			this.state.bindFramebuffer(_target.fbo);
		} else {
			this.target_size.set_x(Luxe.core.screen.get_w());
			this.target_size.set_y(Luxe.core.screen.get_h());
			this.state.bindFramebuffer();
		}
		return this.target = _target;
	}
	,create_default_shaders: function() {
		var vert = null;
		var frag = null;
		var frag_textured = null;
		var frag_bitmapfont = null;
		if(vert == null) {
			vert = haxe_Resource.getString("default.vert.glsl");
			frag = haxe_Resource.getString("default.frag.glsl");
			frag_textured = haxe_Resource.getString("default.frag.textured.glsl");
			frag_bitmapfont = haxe_Resource.getString("default.frag.bitmapfont.glsl");
		}
		var ext = snow_modules_opengl_web_GL.gl.getExtension("OES_standard_derivatives");
		frag = "precision mediump float;\n" + frag;
		frag_textured = "precision mediump float;\n" + frag_textured;
		frag_bitmapfont = "#extension GL_OES_standard_derivatives : enable\n#extension OES_standard_derivatives : enable\nprecision mediump float;\n" + frag_bitmapfont;
		var _plain = new phoenix_Shader({ id : "luxe.shader", frag_id : "default", vert_id : "default"});
		var _textured = new phoenix_Shader({ id : "luxe.shader_textured", frag_id : "textured", vert_id : "default"});
		var _font = new phoenix_Shader({ id : "luxe.shader_bitmapfont", frag_id : "bitmapfont", vert_id : "default"});
		var _ok = true;
		_ok = _ok && _plain.from_string(vert,frag);
		_ok = _ok && _textured.from_string(vert,frag_textured);
		_ok = _ok && _font.from_string(vert,frag_bitmapfont);
		if(!_ok) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_ok" + (" ( " + "Default shaders failed to compile or link. See log for errors" + " )")));
		this.shaders = { plain : { shader : _plain, source : { vert : vert, frag : frag}}, textured : { shader : _textured, source : { vert : vert, frag : frag_textured}}, bitmapfont : { shader : _font, source : { vert : vert, frag : frag_bitmapfont}}};
		null;
	}
	,create_default_font: function() {
		if(this.font_asset == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("font_asset was null" + (" ( " + "Renderer / failed to create the default font" + " )")));
		var _font_texture = new phoenix_Texture({ id : "luxe.font.png", width : this.font_asset.image.width_actual, height : this.font_asset.image.height_actual, pixels : this.font_asset.image.pixels});
		if(_font_texture == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_font_texture was null" + (" ( " + "Renderer / failed to create the default font... font_texture was null." + " )")));
		var _font_data = haxe_Resource.getString("default.fnt");
		this.font = new phoenix_BitmapFont({ id : "luxe.font", font_data : _font_data, pages : [_font_texture]});
		null;
	}
	,__class__: phoenix_Renderer
	,__properties__: {set_target:"set_target",get_target:"get_target"}
};
var phoenix_RendererStats = function() {
	this.vert_count = 0;
	this.draw_calls = 0;
	this.visible_count = 0;
	this.static_batched_count = 0;
	this.dynamic_batched_count = 0;
	this.geometry_count = 0;
	this.batchers = 0;
};
$hxClasses["phoenix.RendererStats"] = phoenix_RendererStats;
phoenix_RendererStats.__name__ = ["phoenix","RendererStats"];
phoenix_RendererStats.prototype = {
	reset: function() {
		this.geometry_count = 0;
		this.dynamic_batched_count = 0;
		this.static_batched_count = 0;
		this.visible_count = 0;
		this.draw_calls = 0;
		this.vert_count = 0;
	}
	,toString: function() {
		return "Renderer Statistics\n" + "\tbatcher count : " + this.batchers + "\n" + "\ttotal geometry : " + this.geometry_count + "\n" + "\tvisible geometry : " + this.visible_count + "\n" + "\tdynamic batched geometry : " + this.dynamic_batched_count + "\n" + "\tstatic batched geometry : " + this.static_batched_count + "\n" + "\ttotal draw calls : " + this.draw_calls + "\n" + "\ttotal vertices : " + this.vert_count;
	}
	,__class__: phoenix_RendererStats
};
var phoenix_Uniforms = function() {
	this.clear();
};
$hxClasses["phoenix.Uniforms"] = phoenix_Uniforms;
phoenix_Uniforms.__name__ = ["phoenix","Uniforms"];
phoenix_Uniforms.prototype = {
	destroy: function() {
		this.ints = null;
		this.floats = null;
		this.vector2s = null;
		this.vector3s = null;
		this.vector4s = null;
		this.matrix4s = null;
		this.colors = null;
		this.textures = null;
		this.dirty_ints = null;
		this.dirty_floats = null;
		this.dirty_vector2s = null;
		this.dirty_vector3s = null;
		this.dirty_vector4s = null;
		this.dirty_matrix4s = null;
		this.dirty_matrix4arrs = null;
		this.dirty_colors = null;
		this.dirty_textures = null;
	}
	,clear: function() {
		this.destroy();
		this.ints = new haxe_ds_StringMap();
		this.floats = new haxe_ds_StringMap();
		this.vector2s = new haxe_ds_StringMap();
		this.vector3s = new haxe_ds_StringMap();
		this.vector4s = new haxe_ds_StringMap();
		this.matrix4s = new haxe_ds_StringMap();
		this.matrix4arrs = new haxe_ds_StringMap();
		this.colors = new haxe_ds_StringMap();
		this.textures = new haxe_ds_StringMap();
		this.dirty_ints = [];
		this.dirty_floats = [];
		this.dirty_vector2s = [];
		this.dirty_vector3s = [];
		this.dirty_vector4s = [];
		this.dirty_matrix4s = [];
		this.dirty_matrix4arrs = [];
		this.dirty_colors = [];
		this.dirty_textures = [];
	}
	,set_int: function(_name,_value,_location) {
		var _int = this.ints.get(_name);
		if(_int != null) _int.value = _value; else {
			_int = new phoenix__$Shader_Uniform_$Int(_name,_value,_location);
			this.ints.set(_name,_int);
		}
		this.dirty_ints.push(_int);
	}
	,set_float: function(_name,_value,_location) {
		var _float = this.floats.get(_name);
		if(_float != null) _float.value = _value; else {
			_float = new phoenix__$Shader_Uniform_$Float(_name,_value,_location);
			this.floats.set(_name,_float);
		}
		this.dirty_floats.push(_float);
	}
	,set_vector2: function(_name,_value,_location) {
		var _vector2 = this.vector2s.get(_name);
		if(_vector2 != null) _vector2.value = _value; else {
			_vector2 = new phoenix__$Shader_Uniform_$phoenix_$Vector(_name,_value,_location);
			this.vector2s.set(_name,_vector2);
		}
		this.dirty_vector2s.push(_vector2);
	}
	,set_vector3: function(_name,_value,_location) {
		var _vector3 = this.vector3s.get(_name);
		if(_vector3 != null) _vector3.value = _value; else {
			_vector3 = new phoenix__$Shader_Uniform_$phoenix_$Vector(_name,_value,_location);
			this.vector3s.set(_name,_vector3);
		}
		this.dirty_vector3s.push(_vector3);
	}
	,set_vector4: function(_name,_value,_location) {
		var _vector4 = this.vector4s.get(_name);
		if(_vector4 != null) _vector4.value = _value; else {
			_vector4 = new phoenix__$Shader_Uniform_$phoenix_$Vector(_name,_value,_location);
			this.vector4s.set(_name,_vector4);
		}
		this.dirty_vector4s.push(_vector4);
	}
	,set_matrix4: function(_name,_value,_location) {
		var _matrix4 = this.matrix4s.get(_name);
		if(_matrix4 != null) _matrix4.value = _value; else {
			_matrix4 = new phoenix__$Shader_Uniform_$phoenix_$Matrix(_name,_value,_location);
			this.matrix4s.set(_name,_matrix4);
		}
		this.dirty_matrix4s.push(_matrix4);
	}
	,set_matrix4_arr: function(_name,_value,_location) {
		var _matrix4 = this.matrix4arrs.get(_name);
		if(_matrix4 != null) _matrix4.value = _value; else {
			_matrix4 = new phoenix__$Shader_Uniform_$snow_$api_$buffers_$Float32Array(_name,_value,_location);
			this.matrix4arrs.set(_name,_matrix4);
		}
		this.dirty_matrix4arrs.push(_matrix4);
	}
	,set_color: function(_name,_value,_location) {
		var _color = this.colors.get(_name);
		if(_color != null) _color.value = _value; else {
			_color = new phoenix__$Shader_Uniform_$phoenix_$Color(_name,_value,_location);
			this.colors.set(_name,_color);
		}
		this.dirty_colors.push(_color);
	}
	,set_texture: function(_name,_value,_location) {
		var _texture = this.textures.get(_name);
		if(_texture != null) _texture.value = _value; else {
			_texture = new phoenix__$Shader_Uniform_$phoenix_$Texture(_name,_value,_location);
			this.textures.set(_name,_texture);
		}
		this.dirty_textures.push(_texture);
	}
	,apply: function() {
		while(this.dirty_ints.length > 0) {
			var uf = this.dirty_ints.pop();
			snow_modules_opengl_web_GL.gl.uniform1i(uf.location,uf.value);
		}
		while(this.dirty_floats.length > 0) {
			var uf1 = this.dirty_floats.pop();
			snow_modules_opengl_web_GL.gl.uniform1f(uf1.location,uf1.value);
		}
		while(this.dirty_vector2s.length > 0) {
			var uf2 = this.dirty_vector2s.pop();
			snow_modules_opengl_web_GL.gl.uniform2f(uf2.location,uf2.value.x,uf2.value.y);
		}
		while(this.dirty_vector3s.length > 0) {
			var uf3 = this.dirty_vector3s.pop();
			snow_modules_opengl_web_GL.gl.uniform3f(uf3.location,uf3.value.x,uf3.value.y,uf3.value.z);
		}
		while(this.dirty_vector4s.length > 0) {
			var uf4 = this.dirty_vector4s.pop();
			snow_modules_opengl_web_GL.gl.uniform4f(uf4.location,uf4.value.x,uf4.value.y,uf4.value.z,uf4.value.w);
		}
		while(this.dirty_colors.length > 0) {
			var uf5 = this.dirty_colors.pop();
			snow_modules_opengl_web_GL.gl.uniform4f(uf5.location,uf5.value.r,uf5.value.g,uf5.value.b,uf5.value.a);
		}
		while(this.dirty_textures.length > 0) {
			var uf6 = this.dirty_textures.pop();
			snow_modules_opengl_web_GL.gl.uniform1i(uf6.location,uf6.value.slot);
			uf6.value.bind();
		}
		while(this.dirty_matrix4s.length > 0) {
			var uf7 = this.dirty_matrix4s.pop();
			snow_modules_opengl_web_GL.uniformMatrix4fv(uf7.location,false,uf7.value.float32array());
		}
		while(this.dirty_matrix4arrs.length > 0) {
			var uf8 = this.dirty_matrix4arrs.pop();
			snow_modules_opengl_web_GL.gl.uniformMatrix4fv(uf8.location,false,uf8.value);
		}
	}
	,__class__: phoenix_Uniforms
};
var phoenix_Shader = function(_options) {
	this.no_default_uniforms = false;
	this.frag_id = "";
	this.vert_id = "";
	this.log = "";
	if(_options == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("_options was null" + ""));
	_options.resource_type = 7;
	luxe_resource_Resource.call(this,_options);
	this.frag_id = _options.frag_id;
	this.vert_id = _options.vert_id;
	if(_options.no_default_uniforms == null) _options.no_default_uniforms = false;
	this.no_default_uniforms = _options.no_default_uniforms;
	this.uniforms = new phoenix_Uniforms();
};
$hxClasses["phoenix.Shader"] = phoenix_Shader;
phoenix_Shader.__name__ = ["phoenix","Shader"];
phoenix_Shader.__super__ = luxe_resource_Resource;
phoenix_Shader.prototype = $extend(luxe_resource_Resource.prototype,{
	activate: function() {
		this["use"]();
		this.uniforms.apply();
		Luxe.renderer.state.activeTexture(33984);
	}
	,'use': function() {
		if(this.program != null) Luxe.renderer.state.useProgram(this.program);
	}
	,deactivate: function() {
		Luxe.renderer.state.useProgram(null);
	}
	,clone: function(_id) {
		var _clone = new phoenix_Shader({ id : _id, frag_id : this.frag_id, vert_id : this.vert_id});
		_clone.from_string(this.vert_source,this.frag_source);
		return _clone;
	}
	,set_int: function(_name,_value) {
		this.uniforms.set_int(_name,_value,snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,_name));
	}
	,set_float: function(_name,_value) {
		this.uniforms.set_float(_name,_value,snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,_name));
	}
	,set_vector2: function(_name,_value) {
		this.uniforms.set_vector2(_name,_value,snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,_name));
	}
	,set_vector3: function(_name,_value) {
		this.uniforms.set_vector3(_name,_value,snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,_name));
	}
	,set_vector4: function(_name,_value) {
		this.uniforms.set_vector4(_name,_value,snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,_name));
	}
	,set_matrix4: function(_name,_value) {
		this.uniforms.set_matrix4(_name,_value,snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,_name));
	}
	,set_matrix4_arr: function(_name,_value) {
		this.uniforms.set_matrix4_arr(_name,_value,snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,_name));
	}
	,set_color: function(_name,_value) {
		this.uniforms.set_color(_name,_value,snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,_name));
	}
	,set_texture: function(_name,_value) {
		this.uniforms.set_texture(_name,_value,snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,_name));
	}
	,compile: function(_type,_source) {
		var _shader = snow_modules_opengl_web_GL.gl.createShader(_type);
		snow_modules_opengl_web_GL.gl.shaderSource(_shader,_source);
		snow_modules_opengl_web_GL.gl.compileShader(_shader);
		var _compile_log = snow_modules_opengl_web_GL.gl.getShaderInfoLog(_shader);
		var _log = "";
		if(_compile_log.length > 0) {
			var _is_frag = _type == 35632;
			var _type_name;
			if(_is_frag) _type_name = "frag"; else _type_name = "vert";
			var _type_id;
			if(_is_frag) _type_id = this.frag_id; else _type_id = this.vert_id;
			_log += "\n\t// start -- (" + _type_name + " / " + _type_id + ") compile log --\n";
			_log += this.format_log(_compile_log);
			_log += "\n\t// end --\n";
		}
		if(snow_modules_opengl_web_GL.gl.getShaderParameter(_shader,35713) == 0) {
			this.log += "\tFailed to compile shader `" + this.id + "`:\n";
			this.add_log(_log.length == 0?this.format_log(snow_modules_opengl_web_GL.gl.getShaderInfoLog(_shader)):_log);
			snow_modules_opengl_web_GL.gl.deleteShader(_shader);
			_shader = null;
			return null;
		}
		return _shader;
	}
	,link: function() {
		this.program = snow_modules_opengl_web_GL.gl.createProgram();
		snow_modules_opengl_web_GL.gl.attachShader(this.program,this.vert_shader);
		snow_modules_opengl_web_GL.gl.attachShader(this.program,this.frag_shader);
		snow_modules_opengl_web_GL.gl.bindAttribLocation(this.program,0,"vertexPosition");
		snow_modules_opengl_web_GL.gl.bindAttribLocation(this.program,1,"vertexTCoord");
		snow_modules_opengl_web_GL.gl.bindAttribLocation(this.program,2,"vertexColor");
		snow_modules_opengl_web_GL.gl.bindAttribLocation(this.program,3,"vertexNormal");
		snow_modules_opengl_web_GL.gl.linkProgram(this.program);
		if(snow_modules_opengl_web_GL.gl.getProgramParameter(this.program,35714) == 0) {
			this.log += "\tFailed to link shader program:";
			this.add_log(this.format_log(snow_modules_opengl_web_GL.gl.getProgramInfoLog(this.program)));
			snow_modules_opengl_web_GL.gl.deleteProgram(this.program);
			this.program = null;
			return false;
		}
		this["use"]();
		if(!this.no_default_uniforms) {
			this.proj_attribute = snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,"projectionMatrix");
			this.view_attribute = snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,"modelViewMatrix");
			var _tex0_attribute = snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,"tex0");
			var _tex1_attribute = snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,"tex1");
			var _tex2_attribute = snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,"tex2");
			var _tex3_attribute = snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,"tex3");
			var _tex4_attribute = snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,"tex4");
			var _tex5_attribute = snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,"tex5");
			var _tex6_attribute = snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,"tex6");
			var _tex7_attribute = snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,"tex7");
			if(_tex0_attribute != null) snow_modules_opengl_web_GL.gl.uniform1i(_tex0_attribute,0);
			if(_tex1_attribute != null) snow_modules_opengl_web_GL.gl.uniform1i(_tex1_attribute,1);
			if(_tex2_attribute != null) snow_modules_opengl_web_GL.gl.uniform1i(_tex2_attribute,2);
			if(_tex3_attribute != null) snow_modules_opengl_web_GL.gl.uniform1i(_tex3_attribute,3);
			if(_tex4_attribute != null) snow_modules_opengl_web_GL.gl.uniform1i(_tex4_attribute,4);
			if(_tex5_attribute != null) snow_modules_opengl_web_GL.gl.uniform1i(_tex5_attribute,5);
			if(_tex6_attribute != null) snow_modules_opengl_web_GL.gl.uniform1i(_tex6_attribute,6);
			if(_tex7_attribute != null) snow_modules_opengl_web_GL.gl.uniform1i(_tex7_attribute,7);
		}
		return true;
	}
	,location: function(_name) {
		return snow_modules_opengl_web_GL.gl.getUniformLocation(this.program,_name);
	}
	,clear: function() {
		if(this.vert_shader != null) snow_modules_opengl_web_GL.gl.deleteShader(this.vert_shader);
		if(this.frag_shader != null) snow_modules_opengl_web_GL.gl.deleteShader(this.frag_shader);
		if(this.program != null) snow_modules_opengl_web_GL.gl.deleteProgram(this.program);
		this.vert_source = null;
		this.frag_source = null;
		this.uniforms.clear();
	}
	,reload: function() {
		var _g = this;
		if(!(this.state != 6)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("state != ResourceState.destroyed" + ""));
		this.clear();
		return new snow_api_Promise(function(resolve,reject) {
			_g.set_state(2);
			var _g1 = _g.frag_id;
			switch(_g1) {
			case "default":
				_g.frag_source = Luxe.renderer.shaders.plain.source.frag;
				break;
			case "textured":
				_g.frag_source = Luxe.renderer.shaders.textured.source.frag;
				break;
			}
			var _g11 = _g.vert_id;
			switch(_g11) {
			case "default":
				_g.vert_source = Luxe.renderer.shaders.plain.source.vert;
				break;
			}
			var _onfail = function(_err) {
				_g.set_state(4);
				reject(_err);
			};
			var _wait = [snow_api_Promise.resolve()];
			if(_g.frag_source == null) {
				var _frag = snow_systems_assets_AssetText.load(Luxe.core.app.assets,_g.frag_id);
				_frag.then(function(_asset) {
					_g.frag_source = _asset.text;
				});
				_wait.push(_frag);
			}
			if(_g.vert_source == null) {
				var _vert = snow_systems_assets_AssetText.load(Luxe.core.app.assets,_g.vert_id);
				_vert.then(function(_asset1) {
					_g.vert_source = _asset1.text;
				});
				_wait.push(_vert);
			}
			snow_api_Promise.all(_wait).then(function() {
				if(_g.from_string(_g.vert_source,_g.frag_source)) {
					_g.set_state(3);
					resolve(_g);
				} else _onfail(snow_types_Error.error("`" + _g.id + "` failed to create :\n\n" + _g.log));
			}).error(function(err) {
				_onfail(snow_types_Error.error("`" + _g.id + "` failed to create :\n\t\t" + err + "\n"));
			});
		});
	}
	,from_string: function(_vert_source,_fragment_source) {
		var _g = this;
		this.clear();
		this.frag_source = _fragment_source;
		this.vert_source = _vert_source;
		this.vert_shader = this.compile(35633,this.vert_source);
		this.frag_shader = this.compile(35632,this.frag_source);
		if(this.vert_shader == null || this.frag_shader == null) {
			if(_g.log.length > 0) haxe_Log.trace("   i / shader / " + _g.log,{ fileName : "Shader.hx", lineNumber : 589, className : "phoenix.Shader", methodName : "from_string"});
			return false;
		}
		if(!this.link()) {
			if(_g.log.length > 0) haxe_Log.trace("   i / shader / " + _g.log,{ fileName : "Shader.hx", lineNumber : 589, className : "phoenix.Shader", methodName : "from_string"});
			return false;
		}
		return true;
	}
	,add_log: function(_log) {
		this.log += _log;
	}
	,toString: function() {
		return "Shader(" + this.id + ") vert:" + this.vert_id + " / frag: " + this.frag_id;
	}
	,format_log: function(_log) {
		var _items = _log.split("\n");
		_items = _items.filter(function(s) {
			return StringTools.trim(s) != "";
		});
		_items = _items.map(function(s1) {
			return "\t\t" + StringTools.trim(s1);
		});
		return _items.join("\n");
	}
	,__class__: phoenix_Shader
});
var phoenix__$Shader_Uniform = function(_name,_value,_location) {
	this.name = _name;
	this.value = _value;
	this.location = _location;
};
$hxClasses["phoenix._Shader.Uniform"] = phoenix__$Shader_Uniform;
phoenix__$Shader_Uniform.__name__ = ["phoenix","_Shader","Uniform"];
phoenix__$Shader_Uniform.prototype = {
	__class__: phoenix__$Shader_Uniform
};
var phoenix_Transform = function() {
	this._destroying = false;
	this._cleaning = false;
	this._setup = true;
	this.dirty = true;
	luxe_ID.call(this,"transform");
	this.set_local(new phoenix_Spatial());
	this.set_world(new phoenix_Spatial());
	this._origin_undo_matrix = new phoenix_Matrix();
	this._pos_matrix = new phoenix_Matrix();
	this._rotation_matrix = new phoenix_Matrix();
	this.set_origin(new phoenix_Vector());
	this.local.pos_changed = $bind(this,this.on_local_pos_change);
	this.local.rotation_changed = $bind(this,this.on_local_rotation_change);
	this.local.scale_changed = $bind(this,this.on_local_scale_change);
	this._setup = false;
};
$hxClasses["phoenix.Transform"] = phoenix_Transform;
phoenix_Transform.__name__ = ["phoenix","Transform"];
phoenix_Transform.__super__ = luxe_ID;
phoenix_Transform.prototype = $extend(luxe_ID.prototype,{
	destroy: function() {
		this._destroying = true;
		if(this.parent != null) this.parent.unlisten($bind(this,this.on_parent_cleaned));
		this._clean_handlers = null;
		this._dirty_handlers = null;
		this._pos_handlers = null;
		this._rotation_handlers = null;
		this._scale_handlers = null;
		this._origin_handlers = null;
		this._parent_handlers = null;
		this.local.destroy();
		((function($this) {
			var $r;
			if(!$this._destroying) {
				if($this.parent != null) {
					if($this.parent.dirty) $this.parent.clean();
				}
				if($this.dirty && !$this._cleaning) $this.clean();
			}
			$r = $this.world;
			return $r;
		}(this))).destroy();
		this.local = null;
		this.world = null;
		this.dirty = true;
		if(this.dirty && !this._setup && this._dirty_handlers != null && this._dirty_handlers.length > 0) this.propagate_dirty();
		this.dirty;
		this.origin = null;
		if(this._origin_handlers != null && this._origin_handlers.length > 0) this.propagate_origin(this.origin);
		this.origin;
		this._origin_undo_matrix = null;
		this._pos_matrix = null;
		this._rotation_matrix = null;
	}
	,set_dirty: function(_dirty) {
		this.dirty = _dirty;
		if(this.dirty && !this._setup && this._dirty_handlers != null && this._dirty_handlers.length > 0) this.propagate_dirty();
		return this.dirty;
	}
	,on_local_pos_change: function(v) {
		this.dirty = true;
		if(this.dirty && !this._setup && this._dirty_handlers != null && this._dirty_handlers.length > 0) this.propagate_dirty();
		this.dirty;
		if(this._pos_handlers != null && this._pos_handlers.length > 0) this.propagate_pos(v);
	}
	,on_local_rotation_change: function(r) {
		this.dirty = true;
		if(this.dirty && !this._setup && this._dirty_handlers != null && this._dirty_handlers.length > 0) this.propagate_dirty();
		this.dirty;
		if(this._rotation_handlers != null && this._rotation_handlers.length > 0) this.propagate_rotation(r);
	}
	,on_local_scale_change: function(s) {
		this.dirty = true;
		if(this.dirty && !this._setup && this._dirty_handlers != null && this._dirty_handlers.length > 0) this.propagate_dirty();
		this.dirty;
		if(this._scale_handlers != null && this._scale_handlers.length > 0) this.propagate_scale(s);
	}
	,on_parent_cleaned: function(p) {
		this.dirty = true;
		if(this.dirty && !this._setup && this._dirty_handlers != null && this._dirty_handlers.length > 0) this.propagate_dirty();
		this.dirty;
	}
	,get_local: function() {
		return this.local;
	}
	,set_local: function(l) {
		if(l != null) {
			this.dirty = true;
			if(this.dirty && !this._setup && this._dirty_handlers != null && this._dirty_handlers.length > 0) this.propagate_dirty();
			this.dirty;
			l.pos_changed = $bind(this,this.on_local_pos_change);
			l.rotation_changed = $bind(this,this.on_local_rotation_change);
			l.scale_changed = $bind(this,this.on_local_scale_change);
		}
		return this.local = l;
	}
	,get_world: function() {
		if(!this._destroying) {
			if(this.parent != null) {
				if(this.parent.dirty) this.parent.clean();
			}
			if(this.dirty && !this._cleaning) this.clean();
		}
		return this.world;
	}
	,clean_check: function() {
		if(this.parent != null) {
			if(this.parent.dirty) this.parent.clean();
		}
		if(this.dirty && !this._cleaning) this.clean();
	}
	,clean: function() {
		if(!this.dirty) return;
		this._cleaning = true;
		this._pos_matrix.makeTranslation(this.local.pos.x,this.local.pos.y,this.local.pos.z);
		this._rotation_matrix.makeRotationFromQuaternion(this.local.rotation);
		this._origin_undo_matrix.makeTranslation(-this.origin.x,-this.origin.y,-this.origin.z);
		this.local.matrix.makeTranslation(this.origin.x,this.origin.y,this.origin.z);
		this.local.matrix.multiply(this._rotation_matrix);
		this.local.matrix.scale(this.local.scale);
		this.local.matrix.setPosition(this.local.pos);
		this.local.matrix.multiply(this._origin_undo_matrix);
		if(this.parent != null) this.get_world().set_matrix(this.get_world().get_matrix().multiplyMatrices(this.parent.get_world().get_matrix(),this.local.matrix)); else this.get_world().get_matrix().copy(this.local.matrix);
		this.get_world().decompose(false);
		this.dirty = false;
		if(this.dirty && !this._setup && this._dirty_handlers != null && this._dirty_handlers.length > 0) this.propagate_dirty();
		this.dirty;
		this._cleaning = false;
		if(this._clean_handlers != null && this._clean_handlers.length > 0) this.propagate_clean();
	}
	,toString: function() {
		return "Transform (" + this.id + ")";
	}
	,get_origin: function() {
		return this.origin;
	}
	,set_origin: function(o) {
		this.dirty = true;
		if(this.dirty && !this._setup && this._dirty_handlers != null && this._dirty_handlers.length > 0) this.propagate_dirty();
		this.dirty;
		this.origin = o;
		if(this._origin_handlers != null && this._origin_handlers.length > 0) this.propagate_origin(this.origin);
		return this.origin;
	}
	,set_world: function(w) {
		if(w == null) return this.world = w;
		this.dirty = true;
		if(this.dirty && !this._setup && this._dirty_handlers != null && this._dirty_handlers.length > 0) this.propagate_dirty();
		this.dirty;
		return this.world = w;
	}
	,get_parent: function() {
		return this.parent;
	}
	,set_parent: function(_p) {
		this.dirty = true;
		if(this.dirty && !this._setup && this._dirty_handlers != null && this._dirty_handlers.length > 0) this.propagate_dirty();
		this.dirty;
		if(this.parent != null) this.parent.unlisten($bind(this,this.on_parent_cleaned));
		this.parent = _p;
		if(this._parent_handlers != null && this._parent_handlers.length > 0) this.propagate_parent(this.parent);
		if(this.parent != null) this.parent.listen($bind(this,this.on_parent_cleaned));
		return this.parent;
	}
	,get_pos: function() {
		return this.local.pos;
	}
	,get_rotation: function() {
		return this.local.rotation;
	}
	,get_scale: function() {
		return this.local.scale;
	}
	,set_pos: function(value) {
		return this.local.set_pos(value);
	}
	,set_rotation: function(value) {
		return this.local.set_rotation(value);
	}
	,set_scale: function(value) {
		return this.local.set_scale(value);
	}
	,propagate_clean: function() {
		var _g = 0;
		var _g1 = this._clean_handlers;
		while(_g < _g1.length) {
			var _handler = _g1[_g];
			++_g;
			if(_handler != null) _handler(this);
		}
	}
	,propagate_dirty: function() {
		var _g = 0;
		var _g1 = this._dirty_handlers;
		while(_g < _g1.length) {
			var _handler = _g1[_g];
			++_g;
			if(_handler != null) _handler(this);
		}
	}
	,propagate_pos: function(_pos) {
		var _g = 0;
		var _g1 = this._pos_handlers;
		while(_g < _g1.length) {
			var _handler = _g1[_g];
			++_g;
			if(_handler != null) _handler(_pos);
		}
	}
	,propagate_rotation: function(_rotation) {
		var _g = 0;
		var _g1 = this._rotation_handlers;
		while(_g < _g1.length) {
			var _handler = _g1[_g];
			++_g;
			if(_handler != null) _handler(_rotation);
		}
	}
	,propagate_scale: function(_scale) {
		var _g = 0;
		var _g1 = this._scale_handlers;
		while(_g < _g1.length) {
			var _handler = _g1[_g];
			++_g;
			if(_handler != null) _handler(_scale);
		}
	}
	,propagate_origin: function(_origin) {
		var _g = 0;
		var _g1 = this._origin_handlers;
		while(_g < _g1.length) {
			var _handler = _g1[_g];
			++_g;
			if(_handler != null) _handler(_origin);
		}
	}
	,propagate_parent: function(_parent) {
		var _g = 0;
		var _g1 = this._parent_handlers;
		while(_g < _g1.length) {
			var _handler = _g1[_g];
			++_g;
			if(_handler != null) _handler(_parent);
		}
	}
	,listen: function(_handler) {
		if(this._clean_handlers == null) this._clean_handlers = [];
		this._clean_handlers.push(_handler);
	}
	,unlisten: function(_handler) {
		if(this._clean_handlers == null) return false;
		return HxOverrides.remove(this._clean_handlers,_handler);
	}
	,listen_dirty: function(_handler) {
		if(this._dirty_handlers == null) this._dirty_handlers = [];
		this._dirty_handlers.push(_handler);
	}
	,unlisten_dirty: function(_handler) {
		if(this._dirty_handlers == null) return false;
		return HxOverrides.remove(this._dirty_handlers,_handler);
	}
	,listen_pos: function(_handler) {
		if(this._pos_handlers == null) this._pos_handlers = [];
		this._pos_handlers.push(_handler);
	}
	,unlisten_pos: function(_handler) {
		if(this._pos_handlers == null) return false;
		return HxOverrides.remove(this._pos_handlers,_handler);
	}
	,listen_scale: function(_handler) {
		if(this._scale_handlers == null) this._scale_handlers = [];
		this._scale_handlers.push(_handler);
	}
	,unlisten_scale: function(_handler) {
		if(this._scale_handlers == null) return false;
		return HxOverrides.remove(this._scale_handlers,_handler);
	}
	,listen_rotation: function(_handler) {
		if(this._rotation_handlers == null) this._rotation_handlers = [];
		this._rotation_handlers.push(_handler);
	}
	,unlisten_rotation: function(_handler) {
		if(this._rotation_handlers == null) return false;
		return HxOverrides.remove(this._rotation_handlers,_handler);
	}
	,listen_origin: function(_handler) {
		if(this._origin_handlers == null) this._origin_handlers = [];
		this._origin_handlers.push(_handler);
	}
	,unlisten_origin: function(_handler) {
		if(this._origin_handlers == null) return false;
		return HxOverrides.remove(this._origin_handlers,_handler);
	}
	,listen_parent: function(_handler) {
		if(this._parent_handlers == null) this._parent_handlers = [];
		this._parent_handlers.push(_handler);
	}
	,unlisten_parent: function(_handler) {
		if(this._parent_handlers == null) return false;
		return HxOverrides.remove(this._parent_handlers,_handler);
	}
	,__class__: phoenix_Transform
	,__properties__: {set_scale:"set_scale",get_scale:"get_scale",set_rotation:"set_rotation",get_rotation:"get_rotation",set_pos:"set_pos",get_pos:"get_pos",set_dirty:"set_dirty",set_origin:"set_origin",get_origin:"get_origin",set_world:"set_world",get_world:"get_world",set_local:"set_local",get_local:"get_local",set_parent:"set_parent",get_parent:"get_parent"}
});
var phoenix_Spatial = function() {
	this._setup = true;
	this.auto_decompose = false;
	this.ignore_listeners = false;
	this.set_matrix(new phoenix_Matrix());
	this.floats = this.matrix.float32array();
	this.set_pos(new phoenix_Vector());
	this.set_rotation(new phoenix_Quaternion());
	this.set_scale(new phoenix_Vector(1,1,1));
	this._setup = false;
};
$hxClasses["phoenix.Spatial"] = phoenix_Spatial;
phoenix_Spatial.__name__ = ["phoenix","Spatial"];
phoenix_Spatial.prototype = {
	destroy: function() {
		this.matrix = null;
		this.matrix;
		this.floats = null;
		this.pos = null;
		this.pos;
		this.rotation = null;
		this.rotation;
		this.scale = null;
		this.scale;
	}
	,decompose: function(_force) {
		if(_force == null) _force = true;
		if(this.auto_decompose || _force) {
			var _transform = this.matrix.decompose(null,null,null);
			this.set_pos(_transform.pos);
			this.set_rotation(_transform.rotation);
			this.set_scale(_transform.scale);
		}
		return this;
	}
	,get_matrix: function() {
		return this.matrix;
	}
	,set_matrix: function(_m) {
		this.matrix = _m;
		if(_m != null) this.floats = this.matrix.float32array();
		return this.matrix;
	}
	,propagate_pos: function(_p) {
		if(this.pos_changed != null && !this.ignore_listeners) this.pos_changed(_p);
	}
	,propagate_rotation: function(_r) {
		if(this.rotation_changed != null && !this.ignore_listeners) this.rotation_changed(_r);
	}
	,propagate_scale: function(_s) {
		if(this.scale_changed != null && !this.ignore_listeners) this.scale_changed(_s);
	}
	,set_pos: function(_p) {
		this.pos = _p;
		if(_p != null) {
			phoenix_Vector.Listen(this.pos,$bind(this,this._pos_change));
			if(this.pos_changed != null && !this.ignore_listeners) this.pos_changed(this.pos);
		}
		return this.pos;
	}
	,set_rotation: function(_r) {
		this.rotation = _r;
		if(_r != null) {
			phoenix_Quaternion.Listen(this.rotation,$bind(this,this._rotation_change));
			if(this.rotation_changed != null && !this.ignore_listeners) this.rotation_changed(this.rotation);
		}
		return this.rotation;
	}
	,set_scale: function(_s) {
		this.scale = _s;
		if(_s != null) {
			phoenix_Vector.Listen(this.scale,$bind(this,this._scale_change));
			if(this.scale_changed != null && !this.ignore_listeners) this.scale_changed(this.scale);
		}
		return this.scale;
	}
	,_pos_change: function(_v) {
		this.set_pos(this.pos);
	}
	,_scale_change: function(_v) {
		this.set_scale(this.scale);
	}
	,_rotation_change: function(_v) {
		this.set_rotation(this.rotation);
	}
	,__class__: phoenix_Spatial
	,__properties__: {set_matrix:"set_matrix",get_matrix:"get_matrix",set_scale:"set_scale",set_rotation:"set_rotation",set_pos:"set_pos"}
};
var phoenix_Vector = function(_x,_y,_z,_w) {
	if(_w == null) _w = 0;
	if(_z == null) _z = 0;
	if(_y == null) _y = 0;
	if(_x == null) _x = 0;
	this._construct = false;
	this.ignore_listeners = false;
	this.w = 0;
	this.z = 0;
	this.y = 0;
	this.x = 0;
	this._construct = true;
	this.x = _x;
	if(this._construct) this.x; else {
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(_x);
		this.x;
	}
	this.y = _y;
	if(this._construct) this.y; else {
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(_y);
		this.y;
	}
	this.z = _z;
	if(this._construct) this.z; else {
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(_z);
		this.z;
	}
	this.w = _w;
	this._construct = false;
};
$hxClasses["phoenix.Vector"] = phoenix_Vector;
phoenix_Vector.__name__ = ["phoenix","Vector"];
phoenix_Vector.Add = function(a,b) {
	return new phoenix_Vector(a.x + b.x,a.y + b.y,a.z + b.z);
};
phoenix_Vector.Subtract = function(a,b) {
	return new phoenix_Vector(a.x - b.x,a.y - b.y,a.z - b.z);
};
phoenix_Vector.MultiplyVector = function(a,b) {
	return new phoenix_Vector(a.x * b.x,a.y * b.y,a.z * b.z);
};
phoenix_Vector.DivideVector = function(a,b) {
	return new phoenix_Vector(a.x / b.x,a.y / b.y,a.z / b.z);
};
phoenix_Vector.Multiply = function(a,b) {
	return new phoenix_Vector(a.x * b,a.y * b,a.z * b);
};
phoenix_Vector.Divide = function(a,b) {
	return new phoenix_Vector(a.x / b,a.y / b,a.z / b);
};
phoenix_Vector.AddScalar = function(a,b) {
	return new phoenix_Vector(a.x + b,a.y + b,a.z + b);
};
phoenix_Vector.SubtractScalar = function(a,b) {
	return new phoenix_Vector(a.x - b,a.y - b,a.z - b);
};
phoenix_Vector.Cross = function(a,b) {
	return new phoenix_Vector(a.y * b.z - a.z * b.y,a.z * b.x - a.x * b.z,a.x * b.y - a.y * b.x);
};
phoenix_Vector.RotationTo = function(a,b) {
	return a.rotationTo(b);
};
phoenix_Vector.Listen = function(_v,listener) {
	_v.listen_x = listener;
	_v.listen_y = listener;
	_v.listen_z = listener;
};
phoenix_Vector.Degrees = function(_radian_vector) {
	return new phoenix_Vector(_radian_vector.x,_radian_vector.y,_radian_vector.z,_radian_vector.w).degrees();
};
phoenix_Vector.Radians = function(_degree_vector) {
	return new phoenix_Vector(_degree_vector.x,_degree_vector.y,_degree_vector.z,_degree_vector.w).radians();
};
phoenix_Vector.prototype = {
	copy_from: function(_other) {
		this.set(_other.x,_other.y,_other.z,_other.w);
		return this;
	}
	,set: function(_x,_y,_z,_w) {
		var prev = this.ignore_listeners;
		this.ignore_listeners = true;
		this.x = _x;
		if(this._construct) this.x; else {
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(_x);
			this.x;
		}
		this.y = _y;
		if(this._construct) this.y; else {
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(_y);
			this.y;
		}
		this.z = _z;
		if(this._construct) this.z; else {
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(_z);
			this.z;
		}
		this.w = _w;
		this.ignore_listeners = prev;
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		return this;
	}
	,set_xy: function(_x,_y) {
		var prev = this.ignore_listeners;
		this.ignore_listeners = true;
		this.x = _x;
		if(this._construct) this.x; else {
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(_x);
			this.x;
		}
		this.y = _y;
		if(this._construct) this.y; else {
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(_y);
			this.y;
		}
		this.ignore_listeners = prev;
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		return this;
	}
	,set_xyz: function(_x,_y,_z) {
		var prev = this.ignore_listeners;
		this.ignore_listeners = true;
		this.x = _x;
		if(this._construct) this.x; else {
			if(this.listen_x != null && !this.ignore_listeners) this.listen_x(_x);
			this.x;
		}
		this.y = _y;
		if(this._construct) this.y; else {
			if(this.listen_y != null && !this.ignore_listeners) this.listen_y(_y);
			this.y;
		}
		this.z = _z;
		if(this._construct) this.z; else {
			if(this.listen_z != null && !this.ignore_listeners) this.listen_z(_z);
			this.z;
		}
		this.ignore_listeners = prev;
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(this.x);
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(this.y);
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(this.z);
		return this;
	}
	,lerp_xy: function(_dest_x,_dest_y,_t) {
		this.set_xy(luxe_utils_Maths.lerp(this.x,_dest_x,_t),luxe_utils_Maths.lerp(this.y,_dest_y,_t));
		return this;
	}
	,lerp_xyz: function(_dest_x,_dest_y,_dest_z,_t) {
		this.set_xyz(luxe_utils_Maths.lerp(this.x,_dest_x,_t),luxe_utils_Maths.lerp(this.y,_dest_y,_t),luxe_utils_Maths.lerp(this.z,_dest_z,_t));
		return this;
	}
	,lerp: function(_other,_t) {
		this.set_xyz(luxe_utils_Maths.lerp(this.x,_other.x,_t),luxe_utils_Maths.lerp(this.y,_other.y,_t),luxe_utils_Maths.lerp(this.z,_other.z,_t));
		return this;
	}
	,weighted_average_xy: function(_dest_x,_dest_y,_slowness) {
		this.set_xy(luxe_utils_Maths.weighted_avg(this.x,_dest_x,_slowness),luxe_utils_Maths.weighted_avg(this.y,_dest_y,_slowness));
		return this;
	}
	,weighted_average_xyz: function(_dest_x,_dest_y,_dest_z,_slowness) {
		this.set_xyz(luxe_utils_Maths.weighted_avg(this.x,_dest_x,_slowness),luxe_utils_Maths.weighted_avg(this.y,_dest_y,_slowness),luxe_utils_Maths.weighted_avg(this.z,_dest_z,_slowness));
		return this;
	}
	,'int': function() {
		this.set_xyz(Math.round(this.x),Math.round(this.y),Math.round(this.z));
		return this;
	}
	,int_x: function() {
		this.set_x(Math.round(this.x));
		return this;
	}
	,int_y: function() {
		this.set_y(Math.round(this.y));
		return this;
	}
	,int_z: function() {
		this.set_z(Math.round(this.z));
		return this;
	}
	,toString: function() {
		return "{ x:" + this.x + ", y:" + this.y + ", z:" + this.z + " }";
	}
	,equals: function(other) {
		return this.x == other.x && this.y == other.y && this.z == other.z && this.w == other.w;
	}
	,clone: function() {
		return new phoenix_Vector(this.x,this.y,this.z,this.w);
	}
	,normalize: function() {
		return this.divideScalar(Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z));
	}
	,dot: function(other) {
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}
	,cross: function(a,b) {
		this.set_xyz(a.y * b.z - a.z * b.y,a.z * b.x - a.x * b.z,a.x * b.y - a.y * b.x);
		return this;
	}
	,invert: function() {
		this.set_xyz(-this.x,-this.y,-this.z);
		return this;
	}
	,add: function(other) {
		if(other == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("other was null" + ""));
		this.set_xyz(this.x + other.x,this.y + other.y,this.z + other.z);
		return this;
	}
	,add_xyz: function(_x,_y,_z) {
		if(_z == null) _z = 0;
		if(_y == null) _y = 0;
		if(_x == null) _x = 0;
		this.set_xyz(this.x + _x,this.y + _y,this.z + _z);
		return this;
	}
	,subtract: function(other) {
		if(other == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("other was null" + ""));
		this.set_xyz(this.x - other.x,this.y - other.y,this.z - other.z);
		return this;
	}
	,subtract_xyz: function(_x,_y,_z) {
		if(_z == null) _z = 0;
		if(_y == null) _y = 0;
		if(_x == null) _x = 0;
		this.set_xyz(this.x - _x,this.y - _y,this.z - _z);
		return this;
	}
	,multiply: function(other) {
		if(other == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("other was null" + ""));
		this.set_xyz(this.x * other.x,this.y * other.y,this.z * other.z);
		return this;
	}
	,multiply_xyz: function(_x,_y,_z) {
		if(_z == null) _z = 1;
		if(_y == null) _y = 1;
		if(_x == null) _x = 1;
		this.set_xyz(this.x * _x,this.y * _y,this.z * _z);
		return this;
	}
	,divide: function(other) {
		if(other == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("other was null" + ""));
		if(!(other.x != 0)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("other.x != 0" + (" ( " + "Vector: division by zero (other.x)" + " )")));
		if(!(other.y != 0)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("other.y != 0" + (" ( " + "Vector: division by zero (other.y)" + " )")));
		this.set_xyz(this.x / other.x,this.y / other.y,this.z / other.z);
		return this;
	}
	,divide_xyz: function(_x,_y,_z) {
		if(_z == null) _z = 1;
		if(_y == null) _y = 1;
		if(_x == null) _x = 1;
		if(!(_x != 0)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_x != 0" + (" ( " + "Vector.divide_xyz: division by zero (x)" + " )")));
		if(!(_y != 0)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_y != 0" + (" ( " + "Vector.divide_xyz: division by zero (y)" + " )")));
		if(!(_z != 0)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_z != 0" + (" ( " + "Vector.divide_xyz: division by zero (z)" + " )")));
		this.set_xyz(this.x / _x,this.y / _y,this.z / _z);
		return this;
	}
	,addScalar: function(v) {
		this.set_xyz(this.x + v,this.y + v,this.z + v);
		return this;
	}
	,subtractScalar: function(v) {
		this.set_xyz(this.x - v,this.y - v,this.z - v);
		return this;
	}
	,multiplyScalar: function(v) {
		this.set_xyz(this.x * v,this.y * v,this.z * v);
		return this;
	}
	,divideScalar: function(v) {
		if(v != 0) this.set_xyz(this.x / v,this.y / v,this.z / v); else this.set_xyz(0,0,0);
		return this;
	}
	,set_length: function(value) {
		this.divideScalar(Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)).multiplyScalar(value);
		return value;
	}
	,get_length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
	,get_lengthsq: function() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	,get_normalized: function() {
		return phoenix_Vector.Divide(this,Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z));
	}
	,set_x: function(_x) {
		this.x = _x;
		if(this._construct) return this.x;
		if(this.listen_x != null && !this.ignore_listeners) this.listen_x(_x);
		return this.x;
	}
	,set_y: function(_y) {
		this.y = _y;
		if(this._construct) return this.y;
		if(this.listen_y != null && !this.ignore_listeners) this.listen_y(_y);
		return this.y;
	}
	,set_z: function(_z) {
		this.z = _z;
		if(this._construct) return this.z;
		if(this.listen_z != null && !this.ignore_listeners) this.listen_z(_z);
		return this.z;
	}
	,get_inverted: function() {
		return new phoenix_Vector(-this.x,-this.y,-this.z);
	}
	,set_angle2D: function(value) {
		var len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
		this.set_xy(Math.cos(value) * len,Math.sin(value) * len);
		return value;
	}
	,get_angle2D: function() {
		return Math.atan2(this.y,this.x);
	}
	,truncate: function(max) {
		this.set_length(Math.min(max,Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)));
		return this;
	}
	,rotationTo: function(other) {
		var theta = Math.atan2(other.x - this.x,other.y - this.y);
		var r = -(180.0 + theta * 180.0 / Math.PI);
		return r;
	}
	,applyQuaternion: function(q) {
		var qx = q.x;
		var qy = q.y;
		var qz = q.z;
		var qw = q.w;
		var ix = qw * this.x + qy * this.z - qz * this.y;
		var iy = qw * this.y + qz * this.x - qx * this.z;
		var iz = qw * this.z + qx * this.y - qy * this.x;
		var iw = -qx * this.x - qy * this.y - qz * this.z;
		this.set_xyz(ix * qw + iw * -qx + iy * -qz - iz * -qy,iy * qw + iw * -qy + iz * -qx - ix * -qz,iz * qw + iw * -qz + ix * -qy - iy * -qx);
		return this;
	}
	,applyProjection: function(m) {
		var e = m.elements;
		var x = this.x;
		var y = this.y;
		var z = this.z;
		var d = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
		this.set_xyz((e[0] * x + e[4] * y + e[8] * z + e[12]) * d,(e[1] * x + e[5] * y + e[9] * z + e[13]) * d,(e[2] * x + e[6] * y + e[10] * z + e[14]) * d);
		return this;
	}
	,transform: function(_m) {
		var _x = this.x;
		var _y = this.y;
		var _z = this.z;
		var e = _m.elements;
		this.set_xyz(e[0] * _x + e[4] * _y + e[8] * _z + e[12],e[1] * _x + e[5] * _y + e[9] * _z + e[13],e[2] * _x + e[6] * _y + e[10] * _z + e[14]);
		return this;
	}
	,transformDirection: function(m) {
		var e = m.elements;
		var x = this.x;
		var y = this.y;
		var z = this.z;
		this.set_xyz(e[0] * x + e[4] * y + e[8] * z,e[1] * x + e[5] * y + e[9] * z,e[2] * x + e[6] * y + e[10] * z);
		this.divideScalar(Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z));
		return this;
	}
	,setEulerFromRotationMatrix: function(m,order) {
		if(order == null) order = 0;
		var te = m.elements;
		var m11 = te[0];
		var m12 = te[4];
		var m13 = te[8];
		var m21 = te[1];
		var m22 = te[5];
		var m23 = te[9];
		var m31 = te[2];
		var m32 = te[6];
		var m33 = te[10];
		var _x = this.x;
		var _y = this.y;
		var _z = this.z;
		if(order == 0) {
			_y = Math.asin(m13 < -1?-1:m13 > 1?1:m13);
			if(Math.abs(m13) < 0.99999) {
				_x = Math.atan2(-m23,m33);
				_z = Math.atan2(-m12,m11);
			} else {
				_x = Math.atan2(m32,m22);
				_z = 0;
			}
		} else if(order == 1) {
			_x = Math.asin(-(m23 < -1?-1:m23 > 1?1:m23));
			if(Math.abs(m23) < 0.99999) {
				_y = Math.atan2(m13,m33);
				_z = Math.atan2(m21,m22);
			} else {
				_y = Math.atan2(-m31,m11);
				_z = 0;
			}
		} else if(order == 2) {
			_x = Math.asin(m32 < -1?-1:m32 > 1?1:m32);
			if(Math.abs(m32) < 0.99999) {
				_y = Math.atan2(-m31,m33);
				_z = Math.atan2(-m12,m22);
			} else {
				_y = 0;
				_z = Math.atan2(m21,m11);
			}
		} else if(order == 3) {
			_y = Math.asin(-(m31 < -1?-1:m31 > 1?1:m31));
			if(Math.abs(m31) < 0.99999) {
				_x = Math.atan2(m32,m33);
				_z = Math.atan2(m21,m11);
			} else {
				_x = 0;
				_z = Math.atan2(-m12,m22);
			}
		} else if(order == 4) {
			_z = Math.asin(m21 < -1?-1:m21 > 1?1:m21);
			if(Math.abs(m21) < 0.99999) {
				_x = Math.atan2(-m23,m22);
				_y = Math.atan2(-m31,m11);
			} else {
				_x = 0;
				_y = Math.atan2(m13,m33);
			}
		} else if(order == 5) {
			_z = Math.asin(-(m12 < -1?-1:m12 > 1?1:m12));
			if(Math.abs(m12) < 0.99999) {
				_x = Math.atan2(m32,m22);
				_y = Math.atan2(m13,m11);
			} else {
				_x = Math.atan2(-m23,m33);
				_y = 0;
			}
		}
		this.set_xyz(_x,_y,_z);
		return this;
	}
	,setEulerFromQuaternion: function(q,order) {
		if(order == null) order = 0;
		var sqx = q.x * q.x;
		var sqy = q.y * q.y;
		var sqz = q.z * q.z;
		var sqw = q.w * q.w;
		var _x = this.x;
		var _y = this.y;
		var _z = this.z;
		if(order == 0) {
			_x = Math.atan2(2 * (q.x * q.w - q.y * q.z),sqw - sqx - sqy + sqz);
			_y = Math.asin(luxe_utils_Maths.clamp(2 * (q.x * q.z + q.y * q.w),-1,1));
			_z = Math.atan2(2 * (q.z * q.w - q.x * q.y),sqw + sqx - sqy - sqz);
		} else if(order == 1) {
			_x = Math.asin(luxe_utils_Maths.clamp(2 * (q.x * q.w - q.y * q.z),-1,1));
			_y = Math.atan2(2 * (q.x * q.z + q.y * q.w),sqw - sqx - sqy + sqz);
			_z = Math.atan2(2 * (q.x * q.y + q.z * q.w),sqw - sqx + sqy - sqz);
		} else if(order == 2) {
			_x = Math.asin(luxe_utils_Maths.clamp(2 * (q.x * q.w + q.y * q.z),-1,1));
			_y = Math.atan2(2 * (q.y * q.w - q.z * q.x),sqw - sqx - sqy + sqz);
			_z = Math.atan2(2 * (q.z * q.w - q.x * q.y),sqw - sqx + sqy - sqz);
		} else if(order == 3) {
			_x = Math.atan2(2 * (q.x * q.w + q.z * q.y),sqw - sqx - sqy + sqz);
			_y = Math.asin(luxe_utils_Maths.clamp(2 * (q.y * q.w - q.x * q.z),-1,1));
			_z = Math.atan2(2 * (q.x * q.y + q.z * q.w),sqw + sqx - sqy - sqz);
		} else if(order == 4) {
			_x = Math.atan2(2 * (q.x * q.w - q.z * q.y),sqw - sqx + sqy - sqz);
			_y = Math.atan2(2 * (q.y * q.w - q.x * q.z),sqw + sqx - sqy - sqz);
			_z = Math.asin(luxe_utils_Maths.clamp(2 * (q.x * q.y + q.z * q.w),-1,1));
		} else if(order == 5) {
			_x = Math.atan2(2 * (q.x * q.w + q.y * q.z),sqw - sqx + sqy - sqz);
			_y = Math.atan2(2 * (q.x * q.z + q.y * q.w),sqw + sqx - sqy - sqz);
			_z = Math.asin(luxe_utils_Maths.clamp(2 * (q.z * q.w - q.x * q.y),-1,1));
		}
		this.set_xyz(_x,_y,_z);
		return this;
	}
	,degrees: function() {
		this.set_xyz(this.x * 57.29577951308238,this.y * 57.29577951308238,this.z * 57.29577951308238);
		return this;
	}
	,radians: function() {
		this.set_xyz(this.x * 0.017453292519943278,this.y * 0.017453292519943278,this.z * 0.017453292519943278);
		return this;
	}
	,__class__: phoenix_Vector
	,__properties__: {get_inverted:"get_inverted",get_normalized:"get_normalized",set_angle2D:"set_angle2D",get_angle2D:"get_angle2D",get_lengthsq:"get_lengthsq",set_length:"set_length",get_length:"get_length",set_z:"set_z",set_y:"set_y",set_x:"set_x"}
};
var phoenix__$Vector_Vec_$Impl_$ = {};
$hxClasses["phoenix._Vector.Vec_Impl_"] = phoenix__$Vector_Vec_$Impl_$;
phoenix__$Vector_Vec_$Impl_$.__name__ = ["phoenix","_Vector","Vec_Impl_"];
phoenix__$Vector_Vec_$Impl_$._new = function(_x,_y,_z,_w) {
	return new phoenix_Vector(_x,_y,_z,_w);
};
phoenix__$Vector_Vec_$Impl_$._multiply = function(lhs,rhs) {
	return new phoenix_Vector(lhs.x * rhs.x,lhs.y * rhs.y,lhs.z * rhs.z);
};
phoenix__$Vector_Vec_$Impl_$._multiply_scalar = function(lhs,rhs) {
	return phoenix_Vector.Multiply(lhs,rhs);
};
phoenix__$Vector_Vec_$Impl_$._multiply_scalar_int = function(lhs,rhs) {
	return phoenix_Vector.Multiply(lhs,rhs);
};
phoenix__$Vector_Vec_$Impl_$._divide = function(lhs,rhs) {
	return new phoenix_Vector(lhs.x / rhs.x,lhs.y / rhs.y,lhs.z / rhs.z);
};
phoenix__$Vector_Vec_$Impl_$._divide_scalar = function(lhs,rhs) {
	return new phoenix_Vector(lhs.x / rhs,lhs.y / rhs,lhs.z / rhs);
};
phoenix__$Vector_Vec_$Impl_$._divide_scalar_int = function(lhs,rhs) {
	return new phoenix_Vector(lhs.x / rhs,lhs.y / rhs,lhs.z / rhs);
};
phoenix__$Vector_Vec_$Impl_$._add = function(lhs,rhs) {
	return new phoenix_Vector(lhs.x + rhs.x,lhs.y + rhs.y,lhs.z + rhs.z);
};
phoenix__$Vector_Vec_$Impl_$._add_scalar = function(lhs,rhs) {
	return new phoenix_Vector(lhs.x + rhs,lhs.y + rhs,lhs.z + rhs);
};
phoenix__$Vector_Vec_$Impl_$._add_scalar_int = function(lhs,rhs) {
	return new phoenix_Vector(lhs.x + rhs,lhs.y + rhs,lhs.z + rhs);
};
phoenix__$Vector_Vec_$Impl_$._subtract = function(lhs,rhs) {
	return new phoenix_Vector(lhs.x - rhs.x,lhs.y - rhs.y,lhs.z - rhs.z);
};
phoenix__$Vector_Vec_$Impl_$._subtract_scalar = function(lhs,rhs) {
	return new phoenix_Vector(lhs.x - rhs,lhs.y - rhs,lhs.z - rhs);
};
phoenix__$Vector_Vec_$Impl_$._subtract_scalar_int = function(lhs,rhs) {
	return new phoenix_Vector(lhs.x - rhs,lhs.y - rhs,lhs.z - rhs);
};
var phoenix__$Shader_Uniform_$Float = function(_name,_value,_location) {
	this.name = _name;
	this.value = _value;
	this.location = _location;
};
$hxClasses["phoenix._Shader.Uniform_Float"] = phoenix__$Shader_Uniform_$Float;
phoenix__$Shader_Uniform_$Float.__name__ = ["phoenix","_Shader","Uniform_Float"];
phoenix__$Shader_Uniform_$Float.prototype = {
	__class__: phoenix__$Shader_Uniform_$Float
};
var phoenix__$Shader_Uniform_$Int = function(_name,_value,_location) {
	this.name = _name;
	this.value = _value;
	this.location = _location;
};
$hxClasses["phoenix._Shader.Uniform_Int"] = phoenix__$Shader_Uniform_$Int;
phoenix__$Shader_Uniform_$Int.__name__ = ["phoenix","_Shader","Uniform_Int"];
phoenix__$Shader_Uniform_$Int.prototype = {
	__class__: phoenix__$Shader_Uniform_$Int
};
var phoenix__$Shader_Uniform_$phoenix_$Color = function(_name,_value,_location) {
	this.name = _name;
	this.value = _value;
	this.location = _location;
};
$hxClasses["phoenix._Shader.Uniform_phoenix_Color"] = phoenix__$Shader_Uniform_$phoenix_$Color;
phoenix__$Shader_Uniform_$phoenix_$Color.__name__ = ["phoenix","_Shader","Uniform_phoenix_Color"];
phoenix__$Shader_Uniform_$phoenix_$Color.prototype = {
	__class__: phoenix__$Shader_Uniform_$phoenix_$Color
};
var phoenix__$Shader_Uniform_$phoenix_$Matrix = function(_name,_value,_location) {
	this.name = _name;
	this.value = _value;
	this.location = _location;
};
$hxClasses["phoenix._Shader.Uniform_phoenix_Matrix"] = phoenix__$Shader_Uniform_$phoenix_$Matrix;
phoenix__$Shader_Uniform_$phoenix_$Matrix.__name__ = ["phoenix","_Shader","Uniform_phoenix_Matrix"];
phoenix__$Shader_Uniform_$phoenix_$Matrix.prototype = {
	__class__: phoenix__$Shader_Uniform_$phoenix_$Matrix
};
var phoenix__$Shader_Uniform_$phoenix_$Texture = function(_name,_value,_location) {
	this.name = _name;
	this.value = _value;
	this.location = _location;
};
$hxClasses["phoenix._Shader.Uniform_phoenix_Texture"] = phoenix__$Shader_Uniform_$phoenix_$Texture;
phoenix__$Shader_Uniform_$phoenix_$Texture.__name__ = ["phoenix","_Shader","Uniform_phoenix_Texture"];
phoenix__$Shader_Uniform_$phoenix_$Texture.prototype = {
	__class__: phoenix__$Shader_Uniform_$phoenix_$Texture
};
var phoenix__$Shader_Uniform_$phoenix_$Vector = function(_name,_value,_location) {
	this.name = _name;
	this.value = _value;
	this.location = _location;
};
$hxClasses["phoenix._Shader.Uniform_phoenix_Vector"] = phoenix__$Shader_Uniform_$phoenix_$Vector;
phoenix__$Shader_Uniform_$phoenix_$Vector.__name__ = ["phoenix","_Shader","Uniform_phoenix_Vector"];
phoenix__$Shader_Uniform_$phoenix_$Vector.prototype = {
	__class__: phoenix__$Shader_Uniform_$phoenix_$Vector
};
var phoenix__$Shader_Uniform_$snow_$api_$buffers_$Float32Array = function(_name,_value,_location) {
	this.name = _name;
	this.value = _value;
	this.location = _location;
};
$hxClasses["phoenix._Shader.Uniform_snow_api_buffers_Float32Array"] = phoenix__$Shader_Uniform_$snow_$api_$buffers_$Float32Array;
phoenix__$Shader_Uniform_$snow_$api_$buffers_$Float32Array.__name__ = ["phoenix","_Shader","Uniform_snow_api_buffers_Float32Array"];
phoenix__$Shader_Uniform_$snow_$api_$buffers_$Float32Array.prototype = {
	__class__: phoenix__$Shader_Uniform_$snow_$api_$buffers_$Float32Array
};
var phoenix_geometry_Geometry = function(_options) {
	this._prev_count = 0;
	this.dirty_based = true;
	this.dirty = false;
	this.locked = false;
	this.immediate = false;
	this.visible = true;
	this.dirty_clip = false;
	this.dirty_depth = false;
	this.dirty_shader = false;
	this.dirty_texture = false;
	this.dirty_primitive_type = false;
	this.shadow_clip = false;
	this.shadow_depth = 0.0;
	this.id = "";
	this.uuid = "";
	this.dropped = false;
	this.added = false;
	this.buffer_type = 35048;
	this.buffer_based = false;
	this.object_space = false;
	this.uuid = Luxe.utils.uniqueid();
	this.id = this.uuid;
	this.state = new phoenix_geometry_GeometryState();
	this.vertices = [];
	this.batchers = [];
	this.transform = new phoenix_Transform();
	this._final_vert_position = new phoenix_Vector();
	this.set_clip_rect(null);
	this.set_clip(false);
	var _do_add = true;
	if(_options.id == null) _options.id = this.uuid;
	this.id = _options.id;
	this.set_color((function($this) {
		var $r;
		if(_options.color == null) _options.color = new phoenix_Color();
		$r = _options.color;
		return $r;
	}(this)));
	this.set_visible((function($this) {
		var $r;
		if(_options.visible == null) _options.visible = true;
		$r = _options.visible;
		return $r;
	}(this)));
	if(_options.immediate == null) _options.immediate = false;
	this.immediate = _options.immediate;
	if(_options.buffer_based == null) _options.buffer_based = false;
	this.buffer_based = _options.buffer_based;
	if(_options.object_space == null) _options.object_space = false;
	this.object_space = _options.object_space;
	this.state.set_depth((function($this) {
		var $r;
		if(_options.depth == null) _options.depth = $this.state.depth;
		$r = _options.depth;
		return $r;
	}(this)));
	this.state.set_texture((function($this) {
		var $r;
		if(_options.texture == null) _options.texture = $this.state.texture;
		$r = _options.texture;
		return $r;
	}(this)));
	this.state.set_primitive_type((function($this) {
		var $r;
		if(_options.primitive_type == null) _options.primitive_type = $this.state.primitive_type;
		$r = _options.primitive_type;
		return $r;
	}(this)));
	this.state.set_shader((function($this) {
		var $r;
		if(_options.shader == null) _options.shader = $this.state.shader;
		$r = _options.shader;
		return $r;
	}(this)));
	if(_options.clip_rect != null) {
		var _r = _options.clip_rect;
		this.state.set_clip_x(_r.x);
		this.state.set_clip_y(_r.y);
		this.state.set_clip_w(_r.w);
		this.state.set_clip_h(_r.h);
	}
	this.transform.set_pos((function($this) {
		var $r;
		if(_options.pos == null) _options.pos = $this.transform.local.pos;
		$r = _options.pos;
		return $r;
	}(this)));
	this.transform.set_rotation((function($this) {
		var $r;
		if(_options.rotation == null) _options.rotation = $this.transform.local.rotation;
		$r = _options.rotation;
		return $r;
	}(this)));
	this.transform.set_scale((function($this) {
		var $r;
		if(_options.scale == null) _options.scale = $this.transform.local.scale;
		$r = _options.scale;
		return $r;
	}(this)));
	this.transform.set_origin((function($this) {
		var $r;
		if(_options.origin == null) _options.origin = $this.transform.origin;
		$r = _options.origin;
		return $r;
	}(this)));
	if(_options.no_batcher_add != null && _options.no_batcher_add == true) _do_add = false;
	phoenix_geometry_Geometry._sequence_key++;
	this.key = new phoenix_geometry_GeometryKey();
	this.key.uuid = this.uuid;
	this.key.timestamp = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
	this.key.sequence = phoenix_geometry_Geometry._sequence_key;
	this.key.primitive_type = this.state.primitive_type;
	this.key.texture = this.state.texture;
	this.key.shader = this.state.shader;
	this.key.depth = this.state.depth;
	this.key.clip = this.state.clip;
	this.transform.id = this.uuid;
	this.transform.name = this.id;
	if(_options.batcher != null && _do_add) _options.batcher.add(this);
	if(this.buffer_based) {
		if(this.vb_pos != null) null; else {
			this.vb_pos = snow_modules_opengl_web_GL.gl.createBuffer();
			this.vb_tcoords = snow_modules_opengl_web_GL.gl.createBuffer();
			this.vb_colors = snow_modules_opengl_web_GL.gl.createBuffer();
			this.set_dirty(true);
		}
	}
	this.uniforms = new phoenix_Uniforms();
};
$hxClasses["phoenix.geometry.Geometry"] = phoenix_geometry_Geometry;
phoenix_geometry_Geometry.__name__ = ["phoenix","geometry","Geometry"];
phoenix_geometry_Geometry.prototype = {
	key_string: function() {
		return "ts: " + this.key.timestamp + "\n" + "sequence: " + this.key.sequence + "\n" + "primitive_type: " + this.key.primitive_type + "\n" + "texture: " + (this.key.texture == null?"null":this.key.texture.id) + "\n" + "shader: " + (this.key.shader == null?"null":this.key.shader.id) + "\n" + "depth: " + this.key.depth + "\n" + "clip: " + Std.string(this.key.clip);
	}
	,refresh_key: function() {
		this.key.uuid = this.uuid;
		this.key.timestamp = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
		this.key.primitive_type = this.state.primitive_type;
		this.key.texture = this.state.texture;
		this.key.shader = this.state.shader;
		this.key.depth = this.state.depth;
		this.key.clip = this.state.clip;
	}
	,str: function() {
		if(!this.state.log) return;
		haxe_Log.trace("\t\tgeometry ; " + this.id,{ fileName : "Geometry.hx", lineNumber : 219, className : "phoenix.geometry.Geometry", methodName : "str"});
		this.state.log = true;
		this.state.str();
		this.state.log = false;
	}
	,drop: function(remove) {
		if(remove == null) remove = true;
		if(remove && this.added) {
			var _g = 0;
			var _g1 = this.batchers;
			while(_g < _g1.length) {
				var b = _g1[_g];
				++_g;
				b.remove(this,true);
			}
		}
		this.key = null;
		this.set_color(null);
		this.state = null;
		this._final_vert_position = null;
		this.batchers = null;
		this.uuid = null;
		this.id = null;
		this.shadow_texture = null;
		this.shadow_shader = null;
		this.vertices = null;
		if(this.transform != null) {
			this.transform.destroy();
			this.transform = null;
		}
		if(this.uniforms != null) {
			this.uniforms.destroy();
			this.uniforms = null;
		}
		this.destroy_vbos();
		if(this.buffer_pos != null) {
			this.buffer_pos = null;
			this.buffer_tcoords = null;
			this.buffer_colors = null;
			this.buffer_normals = null;
		}
		this.dropped = true;
	}
	,add: function(v) {
		this.vertices.push(v);
	}
	,remove: function(v) {
		HxOverrides.remove(this.vertices,v);
	}
	,batch: function(vert_index,tcoord_index,color_index,normal_index,vertlist,tcoordlist,colorlist,normallist) {
		var _mat = this.transform.get_world().get_matrix();
		var _el = _mat.elements;
		var _count = this.vertices.length;
		var _idx = 0;
		while(_idx < _count) {
			var v = this.vertices[_idx];
			var _vx = v.pos.x;
			var _vy = v.pos.y;
			var _vz = v.pos.z;
			var _tvx = _el[0] * _vx + _el[4] * _vy + _el[8] * _vz + _el[12];
			var _tvy = _el[1] * _vx + _el[5] * _vy + _el[9] * _vz + _el[13];
			var _tvz = _el[2] * _vx + _el[6] * _vy + _el[10] * _vz + _el[14];
			vertlist[vert_index] = _tvx;
			vertlist[vert_index + 1] = _tvy;
			vertlist[vert_index + 2] = _tvz;
			vertlist[vert_index + 3] = v.pos.w;
			vert_index += 4;
			var _vuv = v.uv.uv0;
			tcoordlist[tcoord_index] = _vuv.u;
			tcoordlist[tcoord_index + 1] = _vuv.v;
			tcoordlist[tcoord_index + 2] = _vuv.w;
			tcoordlist[tcoord_index + 3] = _vuv.t;
			tcoord_index += 4;
			colorlist[color_index] = v.color.r;
			colorlist[color_index + 1] = v.color.g;
			colorlist[color_index + 2] = v.color.b;
			colorlist[color_index + 3] = v.color.a;
			color_index += 4;
			normal_index += 4;
			_idx++;
		}
	}
	,batch_object_space: function(vert_index,tcoord_index,color_index,normal_index,vertlist,tcoordlist,colorlist,normallist) {
		var _g = 0;
		var _g1 = this.vertices;
		while(_g < _g1.length) {
			var v = _g1[_g];
			++_g;
			var _vpos = v.pos;
			var _vuv = v.uv.uv0;
			var _vcol = v.color;
			vertlist[vert_index] = _vpos.x;
			vertlist[vert_index + 1] = _vpos.y;
			vertlist[vert_index + 2] = _vpos.z;
			vertlist[vert_index + 3] = _vpos.w;
			vert_index += 4;
			tcoordlist[tcoord_index] = _vuv.u;
			tcoordlist[tcoord_index + 1] = _vuv.v;
			tcoordlist[tcoord_index + 2] = _vuv.w;
			tcoordlist[tcoord_index + 3] = _vuv.t;
			tcoord_index += 4;
			colorlist[color_index] = _vcol.r;
			colorlist[color_index + 1] = _vcol.g;
			colorlist[color_index + 2] = _vcol.b;
			colorlist[color_index + 3] = _vcol.a;
			color_index += 4;
			normal_index += 4;
		}
	}
	,batch_into_arrays: function(vertlist,tcoordlist,colorlist,normallist) {
		var _g = 0;
		var _g1 = this.vertices;
		while(_g < _g1.length) {
			var v = _g1[_g];
			++_g;
			this._final_vert_position.set(v.pos.x,v.pos.y,v.pos.z,v.pos.w);
			this._final_vert_position.transform(this.transform.get_world().get_matrix());
			vertlist.push(this._final_vert_position.x);
			vertlist.push(this._final_vert_position.y);
			vertlist.push(this._final_vert_position.z);
			vertlist.push(this._final_vert_position.w);
			tcoordlist.push(v.uv.uv0.u);
			tcoordlist.push(v.uv.uv0.v);
			tcoordlist.push(v.uv.uv0.w);
			tcoordlist.push(v.uv.uv0.t);
			colorlist.push(v.color.r);
			colorlist.push(v.color.g);
			colorlist.push(v.color.b);
			colorlist.push(v.color.a);
		}
	}
	,destroy_vbos: function() {
		if(this.vb_pos == null) return;
		snow_modules_opengl_web_GL.gl.deleteBuffer(this.vb_pos);
		snow_modules_opengl_web_GL.gl.deleteBuffer(this.vb_tcoords);
		snow_modules_opengl_web_GL.gl.deleteBuffer(this.vb_colors);
	}
	,create_vbos: function() {
		if(this.vb_pos != null) return;
		this.vb_pos = snow_modules_opengl_web_GL.gl.createBuffer();
		this.vb_tcoords = snow_modules_opengl_web_GL.gl.createBuffer();
		this.vb_colors = snow_modules_opengl_web_GL.gl.createBuffer();
		this.set_dirty(true);
	}
	,bind: function() {
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,this.vb_pos);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(0,4,5126,false,0,0);
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,this.vb_tcoords);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(1,4,5126,false,0,0);
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,this.vb_colors);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(2,4,5126,false,0,0);
	}
	,bind_pos: function() {
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,this.vb_pos);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(0,4,5126,false,0,0);
	}
	,bind_tcoords: function() {
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,this.vb_tcoords);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(1,4,5126,false,0,0);
	}
	,bind_colors: function() {
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,this.vb_colors);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(2,4,5126,false,0,0);
	}
	,unbind: function() {
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,null);
	}
	,bind_and_upload: function() {
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,this.vb_pos);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(0,4,5126,false,0,0);
		snow_modules_opengl_web_GL.gl.bufferData(34962,this.buffer_pos,this.buffer_type);
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,this.vb_tcoords);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(1,4,5126,false,0,0);
		snow_modules_opengl_web_GL.gl.bufferData(34962,this.buffer_tcoords,this.buffer_type);
		snow_modules_opengl_web_GL.gl.bindBuffer(34962,this.vb_colors);
		snow_modules_opengl_web_GL.gl.vertexAttribPointer(2,4,5126,false,0,0);
		snow_modules_opengl_web_GL.gl.bufferData(34962,this.buffer_colors,this.buffer_type);
	}
	,update_buffers: function() {
		if(!this.dirty && this.dirty_based) return false;
		var _verts = this.vertices.length;
		if(_verts != this._prev_count || this.buffer_pos == null) {
			var _length = this.vertices.length * 4;
			this.buffer_pos = null;
			this.buffer_normals = null;
			this.buffer_colors = null;
			this.buffer_tcoords = null;
			var this1;
			if(_length != null) this1 = new Float32Array(_length); else this1 = null;
			this.buffer_pos = this1;
			var this2;
			if(_length != null) this2 = new Float32Array(_length); else this2 = null;
			this.buffer_tcoords = this2;
			var this3;
			if(_length != null) this3 = new Float32Array(_length); else this3 = null;
			this.buffer_colors = this3;
		}
		if(this.object_space) this.batch_object_space(0,0,0,0,this.buffer_pos,this.buffer_tcoords,this.buffer_colors,this.buffer_normals); else this.batch(0,0,0,0,this.buffer_pos,this.buffer_tcoords,this.buffer_colors,this.buffer_normals);
		this.set_dirty(false);
		return true;
	}
	,draw: function() {
		snow_modules_opengl_web_GL.gl.drawArrays(this.state.primitive_type,0,this.buffer_pos.length / 4 | 0);
	}
	,translate: function(_offset) {
		this.transform.local.pos.set_xyz(this.transform.local.pos.x + _offset.x,this.transform.local.pos.y + _offset.y,this.transform.local.pos.x + _offset.z);
	}
	,set_locked: function(_locked) {
		if(_locked) this.buffer_type = 35044; else this.buffer_type = 35048;
		if(_locked && this.vb_pos == null) {
			if(this.vb_pos != null) null; else {
				this.vb_pos = snow_modules_opengl_web_GL.gl.createBuffer();
				this.vb_tcoords = snow_modules_opengl_web_GL.gl.createBuffer();
				this.vb_colors = snow_modules_opengl_web_GL.gl.createBuffer();
				this.set_dirty(true);
			}
		}
		if(!_locked && this.vb_pos != null) this.destroy_vbos();
		return this.locked = _locked;
	}
	,get_locked: function() {
		return this.locked;
	}
	,set_dirty: function(_dirty) {
		return this.dirty = _dirty;
	}
	,get_dirty: function() {
		return this.dirty;
	}
	,refresh: function() {
		var _g = 0;
		var _g1 = this.batchers;
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			b.remove(this,false);
		}
		if(this.dirty_primitive_type) {
			this.dirty_primitive_type = false;
			this.state.set_primitive_type(this.shadow_primitive_type);
		}
		if(this.dirty_texture) {
			this.dirty_texture = false;
			this.state.set_texture(this.shadow_texture);
		}
		if(this.dirty_shader) {
			this.dirty_shader = false;
			this.state.set_shader(this.shadow_shader);
		}
		if(this.dirty_depth) {
			this.dirty_depth = false;
			this.state.depth = this.shadow_depth;
		}
		if(this.dirty_clip) {
			this.dirty_clip = false;
			this.state.set_clip(this.shadow_clip);
		}
		this.refresh_key();
		var _g2 = 0;
		var _g11 = this.batchers;
		while(_g2 < _g11.length) {
			var b1 = _g11[_g2];
			++_g2;
			b1.add(this,false);
		}
	}
	,get_primitive_type: function() {
		return this.state.primitive_type;
	}
	,set_primitive_type: function(val) {
		if(this.state.primitive_type != val) {
			this.shadow_primitive_type = val;
			this.dirty_primitive_type = true;
			this.refresh();
		}
		return this.primitive_type = val;
	}
	,get_texture: function() {
		return this.state.texture;
	}
	,set_texture: function(val) {
		if(this.state.texture != val) {
			this.shadow_texture = val;
			this.dirty_texture = true;
			this.refresh();
		}
		return this.texture = val;
	}
	,set_visible: function(val) {
		return this.visible = val;
	}
	,set_color: function(val) {
		if(this.vertices != null && this.vertices.length > 0) {
			var _g = 0;
			var _g1 = this.vertices;
			while(_g < _g1.length) {
				var v = _g1[_g];
				++_g;
				v.color = val;
			}
		}
		return this.color = val;
	}
	,get_shader: function() {
		return this.state.shader;
	}
	,set_shader: function(val) {
		if(this.state.shader != val) {
			this.shadow_shader = val;
			this.dirty_shader = true;
			this.refresh();
		}
		return this.shader = val;
	}
	,get_depth: function() {
		return this.state.depth;
	}
	,set_depth: function(val) {
		if(this.state.depth != val) {
			this.shadow_depth = val;
			this.dirty_depth = true;
			this.refresh();
		}
		return this.depth = val;
	}
	,get_clip: function() {
		return this.state.clip;
	}
	,set_clip: function(val) {
		if(this.state.clip != val) {
			this.shadow_clip = val;
			this.dirty_clip = true;
			this.refresh();
		}
		return this.clip = val;
	}
	,get_clip_rect: function() {
		return this.clip_rect;
	}
	,set_clip_rect: function(val) {
		if(val == null) this.set_clip(false); else {
			this.set_clip(true);
			this.state.set_clip_x(val.x);
			this.state.set_clip_y(val.y);
			this.state.set_clip_w(val.w);
			this.state.set_clip_h(val.h);
		}
		return this.clip_rect = val;
	}
	,__class__: phoenix_geometry_Geometry
	,__properties__: {set_clip:"set_clip",get_clip:"get_clip",set_color:"set_color",set_dirty:"set_dirty",get_dirty:"get_dirty",set_locked:"set_locked",get_locked:"get_locked",set_visible:"set_visible",set_clip_rect:"set_clip_rect",get_clip_rect:"get_clip_rect",set_depth:"set_depth",get_depth:"get_depth",set_shader:"set_shader",get_shader:"get_shader",set_texture:"set_texture",get_texture:"get_texture",set_primitive_type:"set_primitive_type",get_primitive_type:"get_primitive_type"}
};
var phoenix_geometry_RingGeometry = function(_options) {
	_options.primitive_type = 1;
	phoenix_geometry_Geometry.call(this,_options);
	var _radius_x = 32.0;
	var _radius_y = 32.0;
	if(_options.end_angle == null) _options.end_angle = 360;
	_options.end_angle;
	if(_options.start_angle == null) _options.start_angle = 0;
	_options.start_angle;
	if(_options.r != null) {
		_radius_x = _options.r;
		_radius_y = _options.r;
	}
	if(_options.rx != null) _radius_x = _options.rx;
	if(_options.ry != null) _radius_y = _options.ry;
	if(_options.steps == null) {
		if(_options.smooth == null) {
			var _max = Math.max(_radius_x,_radius_y);
			_options.steps = Luxe.utils.geometry.segments_for_smooth_circle(_max);
		} else {
			var _smooth = _options.smooth;
			var _max1 = Math.max(_radius_x,_radius_y);
			_options.steps = Luxe.utils.geometry.segments_for_smooth_circle(_max1,_smooth);
		}
	}
	this.set(_options.x,_options.y,_radius_x,_radius_y,_options.steps,_options.start_angle,_options.end_angle);
};
$hxClasses["phoenix.geometry.RingGeometry"] = phoenix_geometry_RingGeometry;
phoenix_geometry_RingGeometry.__name__ = ["phoenix","geometry","RingGeometry"];
phoenix_geometry_RingGeometry.__super__ = phoenix_geometry_Geometry;
phoenix_geometry_RingGeometry.prototype = $extend(phoenix_geometry_Geometry.prototype,{
	set: function(_x,_y,_rx,_ry,_steps,_start_angle_degrees,_end_angle_degrees) {
		if(_end_angle_degrees == null) _end_angle_degrees = 360;
		if(_start_angle_degrees == null) _start_angle_degrees = 0;
		var _start_angle_rad = _start_angle_degrees * 0.017453292519943278;
		var _end_angle_rad = _end_angle_degrees * 0.017453292519943278;
		var _range = _end_angle_rad - _start_angle_rad;
		var theta = _range / _steps;
		var tangential_factor = Math.tan(theta);
		var radial_factor = Math.cos(theta);
		var x = _rx * Math.cos(_start_angle_rad);
		var y = _rx * Math.sin(_start_angle_rad);
		var radial_ratio = _rx / _ry;
		if(radial_ratio == 0) radial_ratio = 0.000000001;
		var _index = 0;
		var _segment_pos = [];
		var _g = 0;
		while(_g < _steps) {
			var i = _g++;
			var __x = x;
			var __y = y / radial_ratio;
			var _seg = new phoenix_Vector(__x,__y);
			_segment_pos.push(_seg);
			this.add(new phoenix_geometry_Vertex(_seg,this.color));
			if(_index > 0) {
				var prevvert = _segment_pos[_index];
				this.add(new phoenix_geometry_Vertex(new phoenix_Vector(prevvert.x,prevvert.y,prevvert.z,prevvert.w),this.color));
			}
			var tx = -y;
			var ty = x;
			x += tx * tangential_factor;
			y += ty * tangential_factor;
			x *= radial_factor;
			y *= radial_factor;
			_index++;
		}
		if(_segment_pos.length > 0) this.add(new phoenix_geometry_Vertex(_segment_pos[0].clone(),this.color));
		this.transform.set_pos(new phoenix_Vector(_x,_y));
	}
	,__class__: phoenix_geometry_RingGeometry
});
var phoenix_geometry_ArcGeometry = function(_options) {
	phoenix_geometry_RingGeometry.call(this,_options);
	this.vertices.pop();
	this.vertices.pop();
};
$hxClasses["phoenix.geometry.ArcGeometry"] = phoenix_geometry_ArcGeometry;
phoenix_geometry_ArcGeometry.__name__ = ["phoenix","geometry","ArcGeometry"];
phoenix_geometry_ArcGeometry.__super__ = phoenix_geometry_RingGeometry;
phoenix_geometry_ArcGeometry.prototype = $extend(phoenix_geometry_RingGeometry.prototype,{
	__class__: phoenix_geometry_ArcGeometry
});
var phoenix_geometry_CircleGeometry = function(_options) {
	_options.primitive_type = 4;
	phoenix_geometry_Geometry.call(this,_options);
	var _radius_x = 32.0;
	var _radius_y = 32.0;
	if(_options.end_angle == null) _options.end_angle = 360;
	_options.end_angle;
	if(_options.start_angle == null) _options.start_angle = 0;
	_options.start_angle;
	if(_options.r != null) {
		_radius_x = _options.r;
		_radius_y = _options.r;
	}
	if(_options.rx != null) _radius_x = _options.rx;
	if(_options.ry != null) _radius_y = _options.ry;
	if(_options.steps == null) {
		if(_options.smooth == null) {
			var _max = Math.max(_radius_x,_radius_y);
			_options.steps = Luxe.utils.geometry.segments_for_smooth_circle(_max);
		} else {
			var _smooth = _options.smooth;
			var _max1 = Math.max(_radius_x,_radius_y);
			_options.steps = Luxe.utils.geometry.segments_for_smooth_circle(_max1,_smooth);
		}
	}
	this.set(_options.x,_options.y,_radius_x,_radius_y,_options.steps,_options.start_angle,_options.end_angle);
};
$hxClasses["phoenix.geometry.CircleGeometry"] = phoenix_geometry_CircleGeometry;
phoenix_geometry_CircleGeometry.__name__ = ["phoenix","geometry","CircleGeometry"];
phoenix_geometry_CircleGeometry.__super__ = phoenix_geometry_Geometry;
phoenix_geometry_CircleGeometry.prototype = $extend(phoenix_geometry_Geometry.prototype,{
	set: function(_x,_y,_rx,_ry,_steps,_start_angle,_end_angle) {
		if(_end_angle == null) _end_angle = 360;
		if(_start_angle == null) _start_angle = 0;
		var half_pi = Math.PI / 2;
		var _start_angle_rad = _start_angle * 0.017453292519943278 - half_pi;
		var _end_angle_rad = _end_angle * 0.017453292519943278 - half_pi;
		var _range = _end_angle_rad - _start_angle_rad;
		_steps = Math.ceil(Math.abs(_range) / (Math.PI * 2) * _steps);
		var theta = _range / _steps;
		var tangential_factor = Math.tan(theta);
		var radial_factor = Math.cos(theta);
		var x = _rx * Math.cos(_start_angle_rad);
		var y = _rx * Math.sin(_start_angle_rad);
		var radial_ratio = _rx / _ry;
		if(radial_ratio == 0) radial_ratio = 0.000000001;
		var _index = 0;
		var _segment_pos = [];
		var _g1 = 0;
		var _g = _steps + 1;
		while(_g1 < _g) {
			var i = _g1++;
			var __x = x;
			var __y = y / radial_ratio;
			var _seg = new phoenix_Vector(__x,__y);
			_segment_pos.push(_seg);
			if(_index > 0) this.add(new phoenix_geometry_Vertex(_seg,this.color));
			this.add(new phoenix_geometry_Vertex(new phoenix_Vector(0,0),this.color));
			this.add(new phoenix_geometry_Vertex(_seg,this.color));
			var tx = -y;
			var ty = x;
			x += tx * tangential_factor;
			y += ty * tangential_factor;
			x *= radial_factor;
			y *= radial_factor;
			_index++;
		}
		this.add(new phoenix_geometry_Vertex(_segment_pos[_steps],this.color));
		this.transform.set_pos(new phoenix_Vector(_x,_y));
	}
	,__class__: phoenix_geometry_CircleGeometry
});
var phoenix_geometry_GeometryKey = function() {
	this.clip = false;
	this.depth = 0;
	this.uuid = "";
	this.sequence = 0;
	this.timestamp = 0;
};
$hxClasses["phoenix.geometry.GeometryKey"] = phoenix_geometry_GeometryKey;
phoenix_geometry_GeometryKey.__name__ = ["phoenix","geometry","GeometryKey"];
phoenix_geometry_GeometryKey.prototype = {
	__class__: phoenix_geometry_GeometryKey
};
var phoenix_geometry_GeometryState = function() {
	this.log = false;
	this.dirty = true;
	this.clip = false;
	this.dirty = true;
	this.clip_x = 0.0;
	this.dirty = true;
	this.clip_y = 0.0;
	this.dirty = true;
	this.clip_w = 0.0;
	this.dirty = true;
	this.clip_h = 0.0;
	this.dirty = true;
	this.texture = null;
	this.dirty = true;
	this.shader = null;
	this.depth = 0.0;
	this.dirty = true;
	this.primitive_type = 0;
	this.dirty = false;
};
$hxClasses["phoenix.geometry.GeometryState"] = phoenix_geometry_GeometryState;
phoenix_geometry_GeometryState.__name__ = ["phoenix","geometry","GeometryState"];
phoenix_geometry_GeometryState.prototype = {
	clone_onto: function(_other) {
		_other.dirty = this.dirty;
		_other.dirty = true;
		_other.texture = this.texture;
		_other.dirty = true;
		_other.shader = this.shader;
		_other.depth = this.depth;
		_other.dirty = true;
		_other.primitive_type = this.primitive_type;
		_other.dirty = true;
		_other.clip = this.clip;
		_other.dirty = true;
		_other.clip_x = this.clip_x;
		_other.dirty = true;
		_other.clip_y = this.clip_y;
		_other.dirty = true;
		_other.clip_w = this.clip_w;
		_other.dirty = true;
		_other.clip_h = this.clip_h;
	}
	,str: function() {
		if(!this.log) return;
		haxe_Log.trace("\t+ GEOMETRYSTATE " + Std.string(this.dirty),{ fileName : "GeometryState.hx", lineNumber : 64, className : "phoenix.geometry.GeometryState", methodName : "str"});
		haxe_Log.trace("\t\tdepth - " + this.depth,{ fileName : "GeometryState.hx", lineNumber : 65, className : "phoenix.geometry.GeometryState", methodName : "str"});
		haxe_Log.trace("\t\ttexture - " + (this.texture == null?"null":this.texture.id),{ fileName : "GeometryState.hx", lineNumber : 66, className : "phoenix.geometry.GeometryState", methodName : "str"});
		if(this.texture != null) haxe_Log.trace("\t\t\t " + Std.string(this.texture.texture),{ fileName : "GeometryState.hx", lineNumber : 68, className : "phoenix.geometry.GeometryState", methodName : "str"});
		haxe_Log.trace("\t\tshader - " + (this.shader == null?"null":this.shader.id),{ fileName : "GeometryState.hx", lineNumber : 70, className : "phoenix.geometry.GeometryState", methodName : "str"});
		haxe_Log.trace("\t\tprimitive_type - " + this.primitive_type,{ fileName : "GeometryState.hx", lineNumber : 71, className : "phoenix.geometry.GeometryState", methodName : "str"});
		haxe_Log.trace("\t\tclip - " + Std.string(this.clip),{ fileName : "GeometryState.hx", lineNumber : 72, className : "phoenix.geometry.GeometryState", methodName : "str"});
		haxe_Log.trace("\t\tclip rect - " + this.clip_x + "," + this.clip_y + "," + this.clip_w + "," + this.clip_h,{ fileName : "GeometryState.hx", lineNumber : 73, className : "phoenix.geometry.GeometryState", methodName : "str"});
		haxe_Log.trace("\t- GEOMETRYSTATE",{ fileName : "GeometryState.hx", lineNumber : 74, className : "phoenix.geometry.GeometryState", methodName : "str"});
	}
	,clean: function() {
		this.dirty = false;
	}
	,update: function(other) {
		if(this.depth != other.depth) this.depth = other.depth;
		if(this.texture != other.texture) {
			this.dirty = true;
			this.texture = other.texture;
		}
		if(this.shader != other.shader) {
			this.dirty = true;
			this.shader = other.shader;
		}
		if(this.primitive_type != other.primitive_type) {
			this.dirty = true;
			this.primitive_type = other.primitive_type;
		}
		if(this.clip != other.clip) {
			this.dirty = true;
			this.clip = other.clip;
		}
		if(this.clip_x != other.clip_x) {
			this.dirty = true;
			this.clip_x = other.clip_x;
		}
		if(this.clip_y != other.clip_y) {
			this.dirty = true;
			this.clip_y = other.clip_y;
		}
		if(this.clip_w != other.clip_w) {
			this.dirty = true;
			this.clip_w = other.clip_w;
		}
		if(this.clip_h != other.clip_h) {
			this.dirty = true;
			this.clip_h = other.clip_h;
		}
	}
	,set_primitive_type: function(val) {
		this.dirty = true;
		return this.primitive_type = val;
	}
	,set_texture: function(val) {
		this.dirty = true;
		return this.texture = val;
	}
	,set_shader: function(val) {
		this.dirty = true;
		return this.shader = val;
	}
	,set_depth: function(val) {
		return this.depth = val;
	}
	,set_clip: function(val) {
		this.dirty = true;
		return this.clip = val;
	}
	,set_clip_x: function(val) {
		this.dirty = true;
		return this.clip_x = val;
	}
	,set_clip_y: function(val) {
		this.dirty = true;
		return this.clip_y = val;
	}
	,set_clip_w: function(val) {
		this.dirty = true;
		return this.clip_w = val;
	}
	,set_clip_h: function(val) {
		this.dirty = true;
		return this.clip_h = val;
	}
	,__class__: phoenix_geometry_GeometryState
	,__properties__: {set_clip_h:"set_clip_h",set_clip_w:"set_clip_w",set_clip_y:"set_clip_y",set_clip_x:"set_clip_x",set_clip:"set_clip",set_depth:"set_depth",set_texture:"set_texture",set_shader:"set_shader",set_primitive_type:"set_primitive_type"}
};
var phoenix_geometry_LineGeometry = function(_options) {
	_options.primitive_type = 1;
	phoenix_geometry_Geometry.call(this,_options);
	if(_options.color == null) _options.color = new phoenix_Color();
	_options.color;
	if(_options.color0 == null) _options.color0 = _options.color;
	_options.color0;
	if(_options.color1 == null) _options.color1 = _options.color;
	_options.color1;
	this.set_p0((function($this) {
		var $r;
		if(_options.p0 == null) _options.p0 = new phoenix_Vector();
		$r = _options.p0;
		return $r;
	}(this)));
	this.set_p1((function($this) {
		var $r;
		if(_options.p1 == null) _options.p1 = new phoenix_Vector(64,64);
		$r = _options.p1;
		return $r;
	}(this)));
	this.add(new phoenix_geometry_Vertex(this.p0,_options.color0));
	this.add(new phoenix_geometry_Vertex(this.p1,_options.color1));
};
$hxClasses["phoenix.geometry.LineGeometry"] = phoenix_geometry_LineGeometry;
phoenix_geometry_LineGeometry.__name__ = ["phoenix","geometry","LineGeometry"];
phoenix_geometry_LineGeometry.__super__ = phoenix_geometry_Geometry;
phoenix_geometry_LineGeometry.prototype = $extend(phoenix_geometry_Geometry.prototype,{
	set_p0: function(_p) {
		this.p0 = _p;
		if(this.vertices.length == 0) return this.p0;
		this.vertices[0].pos = this.p0;
		return this.p0 = _p;
	}
	,set_p1: function(_p) {
		this.p1 = _p;
		if(this.vertices.length == 0) return this.p1;
		this.vertices[1].pos = this.p1;
		return this.p1 = _p;
	}
	,set_color0: function(_c) {
		this.color0 = _c;
		if(this.vertices.length == 0) return this.color0;
		this.vertices[0].color = this.color0;
		return this.color0;
	}
	,set_color1: function(_c) {
		this.color1 = _c;
		if(this.vertices.length == 0) return this.color1;
		this.vertices[1].color = this.color1;
		return this.color1;
	}
	,__class__: phoenix_geometry_LineGeometry
	,__properties__: $extend(phoenix_geometry_Geometry.prototype.__properties__,{set_color1:"set_color1",set_color0:"set_color0",set_p1:"set_p1",set_p0:"set_p0"})
});
var phoenix_geometry_QuadGeometry = function(_options) {
	this._uv_h = 1;
	this._uv_w = 1;
	this._uv_y = 0;
	this._uv_x = 0;
	this.uv_angle = 0;
	this.flipy = false;
	this.flipx = false;
	_options.primitive_type = 4;
	phoenix_geometry_Geometry.call(this,_options);
	if(_options.flipx != null) this.set_flipx(_options.flipx);
	if(_options.flipy != null) this.set_flipy(_options.flipy);
	var _x = _options.x;
	var _y = _options.y;
	var _w = _options.w;
	var _h = _options.h;
	if(_options.rect != null) {
		_x = _options.rect.x;
		_y = _options.rect.y;
		_w = _options.rect.w;
		_h = _options.rect.h;
	}
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(0,0),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(_w,0),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(_w,_h),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(0,_h),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(0,0),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(_w,_h),this.color));
	this.transform.set_pos(this.transform.local.pos.set_xy(_x,_y));
	if(_options.uv != null) this.uv(_options.uv); else this.uv_space(0,0,1,1);
};
$hxClasses["phoenix.geometry.QuadGeometry"] = phoenix_geometry_QuadGeometry;
phoenix_geometry_QuadGeometry.__name__ = ["phoenix","geometry","QuadGeometry"];
phoenix_geometry_QuadGeometry.__super__ = phoenix_geometry_Geometry;
phoenix_geometry_QuadGeometry.prototype = $extend(phoenix_geometry_Geometry.prototype,{
	uv: function(_rect) {
		if(this.state.texture == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("texture was null" + (" ( " + "QuadGeometry; Calling UV on a geometry with null texture." + " )")));
		var tlx = _rect.x / this.state.texture.width_actual;
		var tly = _rect.y / this.state.texture.height_actual;
		var szx = _rect.w / this.state.texture.width_actual;
		var szy = _rect.h / this.state.texture.height_actual;
		this.uv_space(tlx,tly,szx,szy);
	}
	,uv_space: function(_rect_x,_rect_y,_rect_w,_rect_h) {
		if(this.vertices.length == 0) return;
		var sz_x = _rect_w;
		var sz_y = _rect_h;
		var tl_x = _rect_x;
		var tl_y = _rect_y;
		this._uv_x = tl_x;
		this._uv_y = tl_y;
		this._uv_w = sz_x;
		this._uv_h = sz_y;
		var tr_x = tl_x + sz_x;
		var tr_y = tl_y;
		var br_x = tl_x + sz_x;
		var br_y = tl_y + sz_y;
		var bl_x = tl_x;
		var bl_y = tl_y + sz_y;
		var tmp_x = 0.0;
		var tmp_y = 0.0;
		var rotations = this.uv_angle / 90 | 0;
		rotations = rotations - 4 * Math.floor(rotations / 4);
		var _g = 0;
		while(_g < rotations) {
			var r = _g++;
			tmp_x = tl_x;
			tl_x = bl_x;
			bl_x = br_x;
			br_x = tr_x;
			tr_x = tmp_x;
			tmp_y = tl_y;
			tl_y = bl_y;
			bl_y = br_y;
			br_y = tr_y;
			tr_y = tmp_y;
		}
		if(this.flipy) {
			tmp_y = bl_y;
			bl_y = tl_y;
			tl_y = tmp_y;
			tmp_x = bl_x;
			bl_x = tl_x;
			tl_x = tmp_x;
			tmp_y = br_y;
			br_y = tr_y;
			tr_y = tmp_y;
			tmp_x = br_x;
			br_x = tr_x;
			tr_x = tmp_x;
		}
		if(this.flipx) {
			tmp_x = tr_x;
			tr_x = tl_x;
			tl_x = tmp_x;
			tmp_y = tr_y;
			tr_y = tl_y;
			tl_y = tmp_y;
			tmp_x = br_x;
			br_x = bl_x;
			bl_x = tmp_x;
			tmp_y = br_y;
			br_y = bl_y;
			bl_y = tmp_y;
		}
		this.vertices[0].uv.uv0.set_uv(tl_x,tl_y);
		this.vertices[1].uv.uv0.set_uv(tr_x,tr_y);
		this.vertices[2].uv.uv0.set_uv(br_x,br_y);
		this.vertices[3].uv.uv0.set_uv(bl_x,bl_y);
		this.vertices[4].uv.uv0.set_uv(tl_x,tl_y);
		this.vertices[5].uv.uv0.set_uv(br_x,br_y);
		this.set_dirty(true);
	}
	,resize_xy: function(_x,_y) {
		if(this.vertices.length == 0) return;
		this.vertices[0].pos.set_xy(0,0);
		this.vertices[1].pos.set_xy(_x,0);
		this.vertices[2].pos.set_xy(_x,_y);
		this.vertices[3].pos.set_xy(0,_y);
		this.vertices[4].pos.set_xy(0,0);
		this.vertices[5].pos.set_xy(_x,_y);
	}
	,resize: function(quad) {
		this.resize_xy(quad.x,quad.y);
	}
	,set: function(quad) {
		this.set_xywh(quad.x,quad.y,quad.w,quad.h);
	}
	,set_xywh: function(_x,_y,_w,_h) {
		if(this.vertices.length == 0) return;
		this.vertices[0].pos.set_xy(0,0);
		this.vertices[1].pos.set_xy(_w,0);
		this.vertices[2].pos.set_xy(_w,_h);
		this.vertices[3].pos.set_xy(0,_h);
		this.vertices[4].pos.set_xy(0,0);
		this.vertices[5].pos.set_xy(_w,_h);
		this.transform.set_pos(this.transform.local.pos.set_xy(_x,_y));
	}
	,set_flipx: function(_val) {
		this.flipx = _val;
		this.uv_space(this._uv_x,this._uv_y,this._uv_w,this._uv_h);
		return this.flipx;
	}
	,set_flipy: function(_val) {
		this.flipy = _val;
		this.uv_space(this._uv_x,this._uv_y,this._uv_w,this._uv_h);
		return this.flipy;
	}
	,set_uv_angle: function(_val) {
		if(!(_val % 90 == 0)) throw new js__$Boot_HaxeError(luxe_DebugError.assertion("_val % 90 == 0" + (" ( " + "uv_angle has to be a multiple of 90" + " )")));
		this.uv_angle = _val;
		this.uv_space(this._uv_x,this._uv_y,this._uv_w,this._uv_h);
		return this.uv_angle;
	}
	,__class__: phoenix_geometry_QuadGeometry
	,__properties__: $extend(phoenix_geometry_Geometry.prototype.__properties__,{set_uv_angle:"set_uv_angle",set_flipy:"set_flipy",set_flipx:"set_flipx"})
});
var phoenix_geometry_QuadPackGeometry = function(_options) {
	_options.primitive_type = 4;
	phoenix_geometry_Geometry.call(this,_options);
	this.quads = new haxe_ds_IntMap();
};
$hxClasses["phoenix.geometry.QuadPackGeometry"] = phoenix_geometry_QuadPackGeometry;
phoenix_geometry_QuadPackGeometry.__name__ = ["phoenix","geometry","QuadPackGeometry"];
phoenix_geometry_QuadPackGeometry.__super__ = phoenix_geometry_Geometry;
phoenix_geometry_QuadPackGeometry.prototype = $extend(phoenix_geometry_Geometry.prototype,{
	clear: function() {
		var $it0 = this.quads.keys();
		while( $it0.hasNext() ) {
			var q = $it0.next();
			this.quad_remove(q);
		}
	}
	,quad_add: function(_options) {
		if(_options.visible == null) _options.visible = true;
		_options.visible;
		if(_options.flipx == null) _options.flipx = false;
		_options.flipx;
		if(_options.flipy == null) _options.flipy = false;
		_options.flipy;
		var _uid = Luxe.utils.uniquehash();
		var vert0 = new phoenix_geometry_Vertex(new phoenix_Vector(_options.x,_options.y),_options.color);
		var vert1 = new phoenix_geometry_Vertex(new phoenix_Vector(_options.x + _options.w,_options.y),_options.color);
		var vert2 = new phoenix_geometry_Vertex(new phoenix_Vector(_options.x + _options.w,_options.y + _options.h),_options.color);
		var vert3 = new phoenix_geometry_Vertex(new phoenix_Vector(_options.x,_options.y + _options.h),_options.color);
		var vert4 = new phoenix_geometry_Vertex(new phoenix_Vector(_options.x,_options.y),_options.color);
		var vert5 = new phoenix_geometry_Vertex(new phoenix_Vector(_options.x + _options.w,_options.y + _options.h),_options.color);
		this.add(vert0);
		this.add(vert1);
		this.add(vert2);
		this.add(vert3);
		this.add(vert4);
		this.add(vert5);
		var _quad = { uid : _uid, verts : [], flipx : _options.flipx, flipy : _options.flipx, visible : _options.visible, _uv_cache : new phoenix_Rectangle(0,0,1,1)};
		_quad.verts.push(vert0);
		_quad.verts.push(vert1);
		_quad.verts.push(vert2);
		_quad.verts.push(vert3);
		_quad.verts.push(vert4);
		_quad.verts.push(vert5);
		this.quads.h[_uid] = _quad;
		if(_options.uv != null) this.quad_uv(_uid,_options.uv);
		this.set_dirty(true);
		return _uid;
	}
	,quad_remove: function(_quad_id) {
		var _quad = this.quads.h[_quad_id];
		if(_quad != null) {
			this.remove(_quad.verts[0]);
			this.remove(_quad.verts[1]);
			this.remove(_quad.verts[2]);
			this.remove(_quad.verts[3]);
			this.remove(_quad.verts[4]);
			this.remove(_quad.verts[5]);
			this.quads.remove(_quad_id);
			this.set_dirty(true);
		}
	}
	,quad_visible: function(_quad_id,visible) {
		var _quad = this.quads.h[_quad_id];
		if(_quad != null) {
			if(visible && !_quad.visible) {
				_quad.visible = false;
				this.add(_quad.verts[0]);
				this.add(_quad.verts[1]);
				this.add(_quad.verts[2]);
				this.add(_quad.verts[3]);
				this.add(_quad.verts[4]);
				this.add(_quad.verts[5]);
			} else if(!visible && _quad.visible) {
				_quad.visible = false;
				this.remove(_quad.verts[0]);
				this.remove(_quad.verts[1]);
				this.remove(_quad.verts[2]);
				this.remove(_quad.verts[3]);
				this.remove(_quad.verts[4]);
				this.remove(_quad.verts[5]);
			}
			this.set_dirty(true);
		}
	}
	,quad_resize: function(_quad_id,_size) {
		var _quad = this.quads.h[_quad_id];
		if(_quad != null) {
			_quad.verts[0].pos = new phoenix_Vector(_size.x,_size.y);
			_quad.verts[1].pos = new phoenix_Vector(_size.x + _size.w,_size.y);
			_quad.verts[2].pos = new phoenix_Vector(_size.x + _size.w,_size.y + _size.h);
			_quad.verts[3].pos = new phoenix_Vector(_size.x,_size.y + _size.h);
			_quad.verts[4].pos = new phoenix_Vector(_size.x,_size.y);
			_quad.verts[5].pos = new phoenix_Vector(_size.x + _size.w,_size.y + _size.h);
			this.set_dirty(true);
		}
	}
	,quad_pos: function(_quad_id,_p) {
		var _quad = this.quads.h[_quad_id];
		if(_quad != null) {
			var _diffx = _p.x - _quad.verts[0].pos.x;
			var _diffy = _p.y - _quad.verts[0].pos.y;
			var _g = _quad.verts[0].pos;
			_g.set_x(_g.x + _diffx);
			var _g1 = _quad.verts[0].pos;
			_g1.set_y(_g1.y + _diffy);
			var _g2 = _quad.verts[1].pos;
			_g2.set_x(_g2.x + _diffx);
			var _g3 = _quad.verts[1].pos;
			_g3.set_y(_g3.y + _diffy);
			var _g4 = _quad.verts[2].pos;
			_g4.set_x(_g4.x + _diffx);
			var _g5 = _quad.verts[2].pos;
			_g5.set_y(_g5.y + _diffy);
			var _g6 = _quad.verts[3].pos;
			_g6.set_x(_g6.x + _diffx);
			var _g7 = _quad.verts[3].pos;
			_g7.set_y(_g7.y + _diffy);
			var _g8 = _quad.verts[4].pos;
			_g8.set_x(_g8.x + _diffx);
			var _g9 = _quad.verts[4].pos;
			_g9.set_y(_g9.y + _diffy);
			var _g10 = _quad.verts[5].pos;
			_g10.set_x(_g10.x + _diffx);
			var _g11 = _quad.verts[5].pos;
			_g11.set_y(_g11.y + _diffy);
			this.set_dirty(true);
		}
	}
	,quad_color: function(_quad_id,_c) {
		var _quad = this.quads.h[_quad_id];
		if(_quad != null) {
			_quad.verts[0].color = _c;
			_quad.verts[1].color = _c;
			_quad.verts[2].color = _c;
			_quad.verts[3].color = _c;
			_quad.verts[4].color = _c;
			_quad.verts[5].color = _c;
		}
	}
	,quad_alpha: function(_quad_id,_a) {
		var _quad = this.quads.h[_quad_id];
		if(_quad != null) {
			_quad.verts[0].color.a = _a;
			_quad.verts[1].color.a = _a;
			_quad.verts[2].color.a = _a;
			_quad.verts[3].color.a = _a;
			_quad.verts[4].color.a = _a;
			_quad.verts[5].color.a = _a;
		}
	}
	,quad_uv_space: function(_quad_id,_uv) {
		var _quad = this.quads.h[_quad_id];
		if(_quad != null) {
			var flipx = _quad.flipx;
			var flipy = _quad.flipy;
			var sz_x = _uv.w;
			var sz_y = _uv.h;
			var tl_x = _uv.x;
			var tl_y = _uv.y;
			_quad._uv_cache.set(tl_x,tl_y,sz_x,sz_y);
			var tr_x = tl_x + sz_x;
			var tr_y = tl_y;
			var br_x = tl_x + sz_x;
			var br_y = tl_y + sz_y;
			var bl_x = tl_x;
			var bl_y = tl_y + sz_y;
			var tmp_x = 0.0;
			var tmp_y = 0.0;
			if(flipy) {
				tmp_y = bl_y;
				bl_y = tl_y;
				tl_y = tmp_y;
				tmp_y = br_y;
				br_y = tr_y;
				tr_y = tmp_y;
			}
			if(flipx) {
				tmp_x = tr_x;
				tr_x = tl_x;
				tl_x = tmp_x;
				tmp_x = br_x;
				br_x = bl_x;
				bl_x = tmp_x;
			}
			_quad.verts[0].uv.uv0.set_uv(tl_x,tl_y);
			_quad.verts[1].uv.uv0.set_uv(tr_x,tr_y);
			_quad.verts[2].uv.uv0.set_uv(br_x,br_y);
			_quad.verts[3].uv.uv0.set_uv(bl_x,bl_y);
			_quad.verts[4].uv.uv0.set_uv(tl_x,tl_y);
			_quad.verts[5].uv.uv0.set_uv(br_x,br_y);
			this.set_dirty(true);
		}
	}
	,quad_uv: function(_quad_id,_uv) {
		if(this.state.texture == null) {
			haxe_Log.trace("Warning : calling UV on a PackedQuad Geometry with null texture.",{ fileName : "QuadPackGeometry.hx", lineNumber : 352, className : "phoenix.geometry.QuadPackGeometry", methodName : "quad_uv"});
			return;
		}
		var tlx = _uv.x / this.state.texture.width_actual;
		var tly = _uv.y / this.state.texture.height_actual;
		var szx = _uv.w / this.state.texture.width_actual;
		var szy = _uv.h / this.state.texture.height_actual;
		this.quad_uv_space(_quad_id,new phoenix_Rectangle(tlx,tly,szx,szy));
	}
	,quad_flipx: function(_quad_id,_flip) {
		var _quad = this.quads.h[_quad_id];
		if(_quad != null) {
			_quad.flipx = _flip;
			this.quad_uv_space(_quad_id,_quad._uv_cache);
		}
	}
	,quad_flipy: function(_quad_id,_flip) {
		var _quad = this.quads.h[_quad_id];
		if(_quad != null) {
			_quad.flipy = _flip;
			this.quad_uv_space(_quad_id,_quad._uv_cache);
		}
	}
	,__class__: phoenix_geometry_QuadPackGeometry
});
var phoenix_geometry_RectangleGeometry = function(_options) {
	_options.primitive_type = 1;
	phoenix_geometry_Geometry.call(this,_options);
	var _x = _options.x;
	var _y = _options.y;
	var _w = _options.w;
	var _h = _options.h;
	if(_options.rect != null) {
		_x = _options.rect.x;
		_y = _options.rect.y;
		_w = _options.rect.w;
		_h = _options.rect.h;
	}
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(0,0),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(_w,0),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(_w,0),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(_w,_h),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(_w,_h),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(0,_h),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(0,_h),this.color));
	this.add(new phoenix_geometry_Vertex(new phoenix_Vector(0,0),this.color));
	this.transform.set_pos(this.transform.local.pos.set_xy(_x,_y));
};
$hxClasses["phoenix.geometry.RectangleGeometry"] = phoenix_geometry_RectangleGeometry;
phoenix_geometry_RectangleGeometry.__name__ = ["phoenix","geometry","RectangleGeometry"];
phoenix_geometry_RectangleGeometry.__super__ = phoenix_geometry_Geometry;
phoenix_geometry_RectangleGeometry.prototype = $extend(phoenix_geometry_Geometry.prototype,{
	set_xywh: function(_x,_y,_w,_h) {
		if(this.vertices.length == 0) return;
		this.vertices[0].pos.set_xy(0,0);
		this.vertices[1].pos.set_xy(_w,0);
		this.vertices[2].pos.set_xy(_w,0);
		this.vertices[3].pos.set_xy(_w,_h);
		this.vertices[4].pos.set_xy(_w,_h);
		this.vertices[5].pos.set_xy(0,_h);
		this.vertices[6].pos.set_xy(0,_h);
		this.vertices[7].pos.set_xy(0,0);
		this.transform.set_pos(this.transform.local.pos.set_xy(_x,_y));
	}
	,set: function(_rect) {
		this.set_xywh(_rect.x,_rect.y,_rect.w,_rect.h);
	}
	,__class__: phoenix_geometry_RectangleGeometry
});
var phoenix_geometry_TextGeometry = function(_options) {
	this.setup_ = true;
	this.dirty_align = true;
	this.dirty_sizing = true;
	this.point_ratio = 1;
	this.text_h_h = 0;
	this.text_h_w = 0;
	this.text_height = 0;
	this.text_width = 0;
	this.glow_amount = 0;
	this.glow_threshold = 0;
	this.outline = 0;
	this.thickness = 0.5;
	this.smoothness = 0.75;
	this.unique = false;
	this.sdf = false;
	this.bounds_wrap = false;
	this.letter_snapping = false;
	this.letter_spacing = 0.0;
	this.line_spacing = 0.0;
	this.point_size = 32.0;
	this.text = "";
	this.options = _options;
	this.emitter = new luxe_Emitter();
	if(this.options == null) throw new js__$Boot_HaxeError(luxe_DebugError.null_assertion("options was null" + (" ( " + "TextGeometry requires non-null options" + " )")));
	if(this.options.sdf != null) this.sdf = this.options.sdf;
	this.set_font((function($this) {
		var $r;
		if($this.options.font == null) $this.options.font = Luxe.renderer.font;
		$r = $this.options.font;
		return $r;
	}(this)));
	if(this.font == Luxe.renderer.font) this.sdf = true;
	if(this.options.shader == null) {
		if(this.sdf) this.options.shader = Luxe.renderer.shaders.bitmapfont.shader; else this.options.shader = Luxe.renderer.shaders.textured.shader;
	} else if(this.options.shader != Luxe.renderer.shaders.bitmapfont.shader) this.unique = true;
	this.options.primitive_type = 4;
	phoenix_geometry_Geometry.call(this,this.options);
	this.cache = [];
	this.line_widths = [];
	this.line_offsets = [[],[]];
	this.lines = [];
	this.set_outline_color(new phoenix_Color());
	this.set_glow_color(new phoenix_Color());
	this.default_options();
	this.setup_ = false;
};
$hxClasses["phoenix.geometry.TextGeometry"] = phoenix_geometry_TextGeometry;
phoenix_geometry_TextGeometry.__name__ = ["phoenix","geometry","TextGeometry"];
phoenix_geometry_TextGeometry.__super__ = phoenix_geometry_Geometry;
phoenix_geometry_TextGeometry.prototype = $extend(phoenix_geometry_Geometry.prototype,{
	tidy: function() {
		var _vertidx = Math.floor(this.vertices.length / 6);
		var _diff = this.cache.length - _vertidx;
		if(_diff > 0) {
			var extra = this.cache.splice(_vertidx,_diff);
			var c = extra.length;
			while(c > 0) {
				c--;
				var vert = extra.pop();
				vert = null;
			}
		}
	}
	,drop: function(remove) {
		if(remove == null) remove = true;
		this.set_text(null);
		this.set_font(null);
		this.set_bounds(null);
		this.set_outline_color(null);
		this.set_glow_color(null);
		if(this.line_widths != null) {
			this.line_widths.splice(0,this.line_widths.length);
			this.line_widths = null;
		}
		if(this.line_offsets != null) {
			this.line_offsets.splice(0,this.line_offsets.length);
			this.line_offsets = null;
		}
		if(this.lines != null) {
			this.lines.splice(0,this.lines.length);
			this.lines = null;
		}
		this.emitter = null;
		this.options = null;
		if(this.cache != null) {
			while(this.cache.length > 0) {
				var c = this.cache.pop();
				while(c.length > 0) {
					var v = c.pop();
					v.pos = null;
					v.color = null;
					v.normal = null;
					v.uv.destroy();
					v.uv = null;
					v = null;
				}
				c = null;
			}
			this.cache = null;
		}
		phoenix_geometry_Geometry.prototype.drop.call(this,remove);
	}
	,default_options: function() {
		this.set_texture(this.font.pages.h[0]);
		if(this.options.letter_snapping != null) this.set_letter_snapping(this.options.letter_snapping);
		if(this.options.letter_spacing != null) this.set_letter_spacing(this.options.letter_spacing);
		if(this.options.line_spacing != null) this.set_line_spacing(this.options.line_spacing);
		if(this.options.point_size != null) this.set_point_size(this.options.point_size);
		if(this.options.bounds != null) this.set_bounds(this.options.bounds);
		if(this.options.bounds_wrap != null) this.set_bounds_wrap(this.options.bounds_wrap);
		if(this.options.align == null) this.options.align = 0;
		this.options.align;
		if(this.options.align_vertical == null) this.options.align_vertical = 3;
		this.options.align_vertical;
		this.set_align(this.options.align);
		this.set_align_vertical(this.options.align_vertical);
		if(this.options.thickness != null) this.set_thickness(this.options.thickness);
		if(this.options.smoothness != null) this.set_smoothness(this.options.smoothness);
		if(this.options.outline != null) this.set_outline(this.options.outline);
		if(this.options.outline_color != null) this.set_outline_color(this.options.outline_color);
		if(this.options.glow_threshold != null) this.set_glow_threshold(this.options.glow_threshold);
		if(this.options.glow_amount != null) this.set_glow_amount(this.options.glow_amount);
		if(this.options.glow_color != null) this.set_glow_color(this.options.glow_color);
		if(this.sdf) this.flush_uniforms();
		if(this.options.text != null) this.set_text(this.options.text);
	}
	,set_text: function(_text) {
		if(_text == null) _text = "";
		if(this.text != _text) {
			this.text = _text;
			if(this.text != "") {
				this.set_dirty_sizing(true);
				this.update_text();
			} else this.vertices.splice(0,this.vertices.length);
		}
		return this.text;
	}
	,stats: function() {
		return "letters:" + this.vertices.length / 6 + " / cache:" + this.cache.length;
	}
	,update_sizes: function() {
		if(!this.dirty_sizing) return false;
		var drawn_text = phoenix_geometry_TextGeometry.tab_regex.replace(this.text,"    ");
		if(this.bounds_wrap && this.bounds != null) drawn_text = this.font.wrap_string_to_bounds(drawn_text,this.bounds,this.point_size,this.letter_spacing);
		this.lines.splice(0,this.lines.length);
		this.lines = drawn_text.split("\n");
		this.line_widths.splice(0,this.line_widths.length);
		this.text_width = this.font.width_of(drawn_text,this.point_size,this.letter_spacing,this.line_widths);
		this.text_height = this.font.height_of_lines(this.lines,this.point_size,this.line_spacing);
		this.text_h_w = this.text_width / 2;
		this.text_h_h = this.text_height / 2;
		this.point_ratio = this.point_size / this.font.info.point_size;
		this.set_dirty_sizing(false);
		return true;
	}
	,update_text: function() {
		var _g = this;
		var _pos_x = 0.0;
		var _pos_y = 0.0;
		var _bounds_based = this.bounds != null;
		if(_bounds_based) {
			this.transform.local.pos.set_x(_pos_x = this.bounds.x);
			this.transform.local.pos.set_y(_pos_y = this.bounds.y);
		}
		var _cur_x = 0.0;
		var _cur_y = 0.0;
		var _line_idx = 0;
		var _total_idx = 0;
		var _is_char = true;
		var _was_dirty = this.update_sizes();
		var _g1 = 0;
		var _g11 = this.lines;
		while(_g1 < _g11.length) {
			var _line = _g11[_g1];
			++_g1;
			var _line_x_offset = 0.0;
			var _line_y_offset = 0.0;
			if(this.dirty_align) {
				if(!_bounds_based) {
					var _g2 = this.align;
					switch(_g2) {
					case 2:
						_line_x_offset = -(this.line_widths[_line_idx] / 2.0);
						break;
					case 1:
						_line_x_offset = -this.line_widths[_line_idx];
						break;
					default:
						_line_x_offset = 0.0;
					}
					var _g21 = this.align_vertical;
					switch(_g21) {
					case 2:
						_line_y_offset = -this.text_h_h;
						break;
					case 4:
						_line_y_offset = -this.text_height;
						break;
					default:
						_line_y_offset = 0.0;
					}
				} else {
					var _g22 = this.align;
					switch(_g22) {
					case 2:
						_line_x_offset = -(this.line_widths[_line_idx] / 2.0) + this.bounds.w / 2;
						break;
					case 1:
						_line_x_offset = -this.line_widths[_line_idx] + this.bounds.w;
						break;
					default:
						_line_x_offset = 0.0;
					}
					var _g23 = this.align_vertical;
					switch(_g23) {
					case 2:
						_line_y_offset = this.bounds.h / 2 - this.text_h_h;
						break;
					case 4:
						_line_y_offset = this.bounds.h - this.text_height;
						break;
					default:
						_line_y_offset = 0.0;
					}
				}
				this.line_offsets[0][_line_idx] = _line_x_offset;
				this.line_offsets[1][_line_idx] = _line_y_offset;
			} else {
				_line_x_offset = this.line_offsets[0][_line_idx];
				_line_y_offset = this.line_offsets[1][_line_idx];
			}
			if(_line_idx != 0) {
				_cur_y += (_g.font.info.line_height + _g.line_spacing) * _g.point_ratio;
				_cur_x = 0;
			}
			var _idx = 0;
			var _g2_i = 0;
			var _g2_string = _line;
			var _g2_index = 0;
			var _g2_endIndex = _line.length;
			while(_g2_index < _g2_endIndex) {
				var _uglyph;
				_g2_i = _g2_index;
				_g2_index += luxe_utils_unifill_InternalEncoding.codePointWidthAt(_g2_string,_g2_index);
				_uglyph = luxe_utils_unifill__$Utf16_Utf16_$Impl_$.codePointAt(_g2_string,_g2_i);
				var _index = _uglyph;
				var _char = this.font.info.chars.h[_index];
				_is_char = _char != null && _index > 32;
				if(!_is_char) _char = this.font.space_char;
				if(_is_char) {
					var _quad_x = _line_x_offset + _cur_x + _char.xoffset * this.point_ratio;
					var _quad_y = _line_y_offset + _cur_y + _char.yoffset * this.point_ratio;
					if(this.letter_snapping) {
						_quad_x = Math.floor(_quad_x);
						_quad_y = Math.floor(_quad_y);
					}
					var _page = this.font.pages.h[_char.page];
					var _u1 = _char.x / _page.width_actual;
					var _v1 = _char.y / _page.height_actual;
					var _u2 = (_char.x + _char.width) / _page.width_actual;
					var _v2 = (_char.y + _char.height) / _page.height_actual;
					this.update_char(_total_idx,_quad_x,_quad_y,_char.width * this.point_ratio,_char.height * this.point_ratio,_u1,_v1,_u2,_v2,this.color);
					_total_idx++;
				}
				var _x_inc = _char.xadvance;
				if(_idx < _line.length - 1) {
					_x_inc += this.font.kerning(_index,luxe_utils_unifill_Unifill.uCharCodeAt(_line,_idx + 1));
					if(_index >= 32) _x_inc += this.letter_spacing;
				}
				_x_inc *= this.point_ratio;
				_cur_x += _x_inc;
				_idx++;
			}
			_line_idx++;
		}
		var _vertidx = this.vertices.length / 6 | 0;
		var _diff = _vertidx - _total_idx;
		if(_diff > 0) this.vertices.splice(_total_idx * 6,_diff * 6);
		this.dirty_align = false;
		this.emitter.emit(1);
	}
	,update_char: function(_letteridx,_x,_y,_w,_h,_u,_v,_u2,_v2,_color) {
		var vert0;
		var vert1;
		var vert2;
		var vert3;
		var vert4;
		var vert5;
		var quad = this.cache[_letteridx];
		if(quad == null) {
			vert0 = new phoenix_geometry_Vertex(new phoenix_Vector(_x,_y),_color);
			vert1 = new phoenix_geometry_Vertex(new phoenix_Vector(_x + _w,_y),_color);
			vert2 = new phoenix_geometry_Vertex(new phoenix_Vector(_x + _w,_y + _h),_color);
			vert3 = new phoenix_geometry_Vertex(new phoenix_Vector(_x,_y + _h),_color);
			vert4 = new phoenix_geometry_Vertex(new phoenix_Vector(_x,_y),_color);
			vert5 = new phoenix_geometry_Vertex(new phoenix_Vector(_x + _w,_y + _h),_color);
			quad = [vert0,vert1,vert2,vert3,vert4,vert5];
			this.cache[_letteridx] = quad;
		} else {
			vert0 = quad[0];
			vert1 = quad[1];
			vert2 = quad[2];
			vert3 = quad[3];
			vert4 = quad[4];
			vert5 = quad[5];
			vert0.pos.set_xy(_x,_y);
			vert1.pos.set_xy(_x + _w,_y);
			vert2.pos.set_xy(_x + _w,_y + _h);
			vert3.pos.set_xy(_x,_y + _h);
			vert4.pos.set_xy(_x,_y);
			vert5.pos.set_xy(_x + _w,_y + _h);
		}
		vert0.uv.uv0.set_uv(_u,_v);
		vert1.uv.uv0.set_uv(_u2,_v);
		vert2.uv.uv0.set_uv(_u2,_v2);
		vert3.uv.uv0.set_uv(_u,_v2);
		vert4.uv.uv0.set_uv(_u,_v);
		vert5.uv.uv0.set_uv(_u2,_v2);
		var _vertidx = Math.floor(this.vertices.length / 6);
		if(_vertidx <= _letteridx) {
			this.add(vert0);
			this.add(vert1);
			this.add(vert2);
			this.add(vert3);
			this.add(vert4);
			this.add(vert5);
		}
	}
	,set_dirty_sizing: function(_b) {
		this.dirty_align = true;
		return this.dirty_sizing = _b;
	}
	,set_bounds: function(_bounds) {
		this.bounds = _bounds;
		if(this.bounds == null) return this.bounds;
		this.set_dirty_sizing(true);
		this.update_text();
		return this.bounds;
	}
	,set_bounds_wrap: function(_wrap) {
		this.bounds_wrap = _wrap;
		this.set_dirty_sizing(true);
		this.update_text();
		return this.bounds_wrap;
	}
	,set_letter_snapping: function(_snap) {
		this.letter_snapping = _snap;
		this.set_dirty_sizing(true);
		this.update_text();
		return this.letter_snapping;
	}
	,set_line_spacing: function(_line_spacing) {
		this.line_spacing = _line_spacing;
		this.set_dirty_sizing(true);
		this.update_text();
		return this.line_spacing;
	}
	,set_letter_spacing: function(_letter_spacing) {
		this.letter_spacing = _letter_spacing;
		this.set_dirty_sizing(true);
		this.update_text();
		return this.letter_spacing;
	}
	,set_align: function(_align) {
		this.align = _align;
		this.dirty_align = true;
		this.update_text();
		return this.align;
	}
	,set_align_vertical: function(_align_vertical) {
		this.align_vertical = _align_vertical;
		this.dirty_align = true;
		this.update_text();
		return this.align_vertical;
	}
	,set_point_size: function(s) {
		if(s < 0) s = 0;
		this.point_size = s;
		this.set_dirty_sizing(true);
		this.update_text();
		return this.point_size;
	}
	,set_font: function(_font) {
		this.font = _font;
		if(!this.setup_ && _font != null) {
			this.set_texture(this.font.pages.h[0]);
			this.set_dirty_sizing(true);
			this.dirty_align = true;
			this.update_text();
		}
		return this.font;
	}
	,set_smoothness: function(s) {
		if(s < 0) s = 0;
		if(this.state.shader != null && this.sdf && this.unique) this.state.shader.set_float("smoothness",s);
		return this.smoothness = s;
	}
	,set_thickness: function(s) {
		if(s < 0) s = 0;
		if(this.state.shader != null && this.sdf && this.unique) this.state.shader.set_float("thickness",s);
		return this.thickness = s;
	}
	,set_outline: function(s) {
		if(s < 0.0) s = 0.0; else if(s > 1.0) s = 1.0; else s = s;
		if(this.state.shader != null && this.sdf && this.unique) this.state.shader.set_float("outline",s);
		return this.outline = s;
	}
	,set_glow_threshold: function(s) {
		if(s < 0) s = 0;
		if(this.state.shader != null && this.sdf && this.unique) this.state.shader.set_float("glow_threshold",s);
		return this.glow_threshold = s;
	}
	,set_glow_amount: function(s) {
		if(s < 0) s = 0;
		if(this.state.shader != null && this.sdf && this.unique) this.state.shader.set_float("glow_amount",s);
		return this.glow_amount = s;
	}
	,set_outline_color: function(c) {
		if(c == null) return this.outline_color = c;
		if(this.state.shader != null && this.sdf && this.unique) this.state.shader.set_color("outline_color",c);
		return this.outline_color = c;
	}
	,set_glow_color: function(c) {
		if(c == null) return this.glow_color = c;
		if(this.state.shader != null && this.sdf && this.unique) this.state.shader.set_color("glow_color",c);
		return this.glow_color = c;
	}
	,flush_uniforms: function() {
		if(this.state.shader != null && this.sdf) {
			this.state.shader.set_float("smoothness",this.smoothness);
			this.state.shader.set_float("thickness",this.thickness);
			this.state.shader.set_float("outline",this.outline);
			this.state.shader.set_float("glow_threshold",this.glow_threshold);
			this.state.shader.set_float("glow_amount",this.glow_amount);
			this.state.shader.set_color("outline_color",this.outline_color);
			this.state.shader.set_color("glow_color",this.glow_color);
		}
	}
	,__class__: phoenix_geometry_TextGeometry
	,__properties__: $extend(phoenix_geometry_Geometry.prototype.__properties__,{set_dirty_sizing:"set_dirty_sizing",set_glow_color:"set_glow_color",set_glow_amount:"set_glow_amount",set_glow_threshold:"set_glow_threshold",set_outline_color:"set_outline_color",set_outline:"set_outline",set_thickness:"set_thickness",set_smoothness:"set_smoothness",set_align_vertical:"set_align_vertical",set_align:"set_align",set_bounds_wrap:"set_bounds_wrap",set_bounds:"set_bounds",set_letter_snapping:"set_letter_snapping",set_letter_spacing:"set_letter_spacing",set_line_spacing:"set_line_spacing",set_point_size:"set_point_size",set_font:"set_font",set_text:"set_text"})
});
var phoenix_geometry_TextureCoordSet = function() {
	this.uv0 = new phoenix_geometry_TextureCoord();
	this.uv1 = new phoenix_geometry_TextureCoord();
	this.uv2 = new phoenix_geometry_TextureCoord();
	this.uv3 = new phoenix_geometry_TextureCoord();
	this.uv4 = new phoenix_geometry_TextureCoord();
	this.uv5 = new phoenix_geometry_TextureCoord();
	this.uv6 = new phoenix_geometry_TextureCoord();
	this.uv7 = new phoenix_geometry_TextureCoord();
};
$hxClasses["phoenix.geometry.TextureCoordSet"] = phoenix_geometry_TextureCoordSet;
phoenix_geometry_TextureCoordSet.__name__ = ["phoenix","geometry","TextureCoordSet"];
phoenix_geometry_TextureCoordSet.prototype = {
	clone: function() {
		var _set = new phoenix_geometry_TextureCoordSet();
		_set.uv0.set(this.uv0.u,this.uv0.v,this.uv0.w,this.uv0.t);
		_set.uv1.set(this.uv1.u,this.uv1.v,this.uv1.w,this.uv1.t);
		_set.uv2.set(this.uv2.u,this.uv2.v,this.uv2.w,this.uv2.t);
		_set.uv3.set(this.uv3.u,this.uv3.v,this.uv3.w,this.uv3.t);
		_set.uv4.set(this.uv4.u,this.uv4.v,this.uv4.w,this.uv4.t);
		_set.uv5.set(this.uv5.u,this.uv5.v,this.uv5.w,this.uv5.t);
		_set.uv6.set(this.uv6.u,this.uv6.v,this.uv6.w,this.uv6.t);
		_set.uv7.set(this.uv7.u,this.uv7.v,this.uv7.w,this.uv7.t);
		return _set;
	}
	,destroy: function() {
		this.uv0 = null;
		this.uv1 = null;
		this.uv2 = null;
		this.uv3 = null;
		this.uv4 = null;
		this.uv5 = null;
		this.uv6 = null;
		this.uv7 = null;
	}
	,__class__: phoenix_geometry_TextureCoordSet
};
var phoenix_geometry_TextureCoord = function(_u,_v,_w,_t) {
	if(_t == null) _t = 0.0;
	if(_w == null) _w = 0.0;
	if(_v == null) _v = 0.0;
	if(_u == null) _u = 0.0;
	this.t = 0.0;
	this.w = 0.0;
	this.v = 0.0;
	this.u = 0.0;
	this.u = _u;
	this.v = _v;
	this.w = _w;
	this.t = _t;
};
$hxClasses["phoenix.geometry.TextureCoord"] = phoenix_geometry_TextureCoord;
phoenix_geometry_TextureCoord.__name__ = ["phoenix","geometry","TextureCoord"];
phoenix_geometry_TextureCoord.prototype = {
	clone: function() {
		return new phoenix_geometry_TextureCoord(this.u,this.v,this.w,this.t);
	}
	,set: function(_u,_v,_w,_t) {
		this.u = _u;
		this.v = _v;
		this.w = _w;
		this.t = _t;
		return this;
	}
	,set_uv: function(_u,_v) {
		this.u = _u;
		this.v = _v;
		return this;
	}
	,toString: function() {
		return "{ u:" + this.v + ", v:" + this.v + " }";
	}
	,__class__: phoenix_geometry_TextureCoord
};
var phoenix_geometry_Vertex = function(_pos,_color,_normal) {
	this.uv = new phoenix_geometry_TextureCoordSet();
	this.pos = _pos;
	if(_color == null) this.color = new phoenix_Color(); else this.color = _color;
	if(_normal == null) this.normal = new phoenix_Vector(); else this.normal = _normal;
};
$hxClasses["phoenix.geometry.Vertex"] = phoenix_geometry_Vertex;
phoenix_geometry_Vertex.__name__ = ["phoenix","geometry","Vertex"];
phoenix_geometry_Vertex.prototype = {
	clone: function() {
		var _new = new phoenix_geometry_Vertex(this.pos.clone(),this.color.clone(),this.normal.clone());
		_new.uv = this.uv.clone();
		return _new;
	}
	,destroy: function() {
		this.pos = null;
		this.color = null;
		this.normal = null;
		this.uv.destroy();
		this.uv = null;
	}
	,__class__: phoenix_geometry_Vertex
};
var phoenix_utils_Rendering = function() { };
$hxClasses["phoenix.utils.Rendering"] = phoenix_utils_Rendering;
phoenix_utils_Rendering.__name__ = ["phoenix","utils","Rendering"];
phoenix_utils_Rendering.gl_blend_mode_from_BlendMode = function(_b) {
	switch(_b) {
	case 0:
		return 0;
	case 1:
		return 1;
	case 768:
		return 768;
	case 769:
		return 769;
	case 770:
		return 770;
	case 771:
		return 771;
	case 772:
		return 772;
	case 773:
		return 773;
	case 774:
		return 774;
	case 775:
		return 775;
	case 776:
		return 776;
	}
};
phoenix_utils_Rendering.fovx_to_y = function(fovx,aspect) {
	return 180 / Math.PI * (2 * Math.atan(Math.tan(fovx * (Math.PI / 180) / 2) * (1 / aspect)));
};
var snow_Snow = function(_host) {
	this.had_ready_event = false;
	this.i = 0;
	this.immediate_shutdown = false;
	this.has_shutdown = false;
	this.shutting_down = false;
	this.debug = false;
	this.platform = "unknown";
	this.ready = false;
	this.freeze = false;
	if(_host == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_host was null" + (" ( " + "snow App instance was null!" + " )")));
	this.host = _host;
	this.host.app = this;
	this.config = this.default_config();
	this.sys_event = new snow_types_SystemEvent();
	this.win_event = new snow_types_WindowEvent();
	this.io = new snow_systems_io_IO(this);
	this.input = new snow_systems_input_Input(this);
	this.audio = new snow_systems_audio_Audio(this);
	this.assets = new snow_systems_assets_Assets(this);
	this.extensions = [];
	var _g = 0;
	var _g1 = snow_types_Config.extensions;
	while(_g < _g1.length) {
		var _ext_type = _g1[_g];
		++_g;
		var _class = Type.resolveClass(_ext_type);
		if(_class == null) throw new js__$Boot_HaxeError(snow_types_Error.error("Extension `" + _ext_type + "`: Type not found via Type.resolveClass!"));
		var _instance = Type.createInstance(_class,null);
		if(_instance == null) throw new js__$Boot_HaxeError(snow_types_Error.error("Extension `" + _ext_type + "`: Instance was null on calling new()!"));
		this.extensions.push(_instance);
	}
	this.runtime = new snow_core_web_Runtime(this);
	if(this.os == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("os was null" + (" ( " + "init - Runtime didn't set the app.os value!" + " )")));
	if(this.platform == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("platform was null" + (" ( " + "init - Runtime didn't set the app.platform value!" + " )")));
	this.dispatch_event(1);
	this.host.internal_init();
	snow_api_Promises.step();
	while(snow_Snow.next_queue.length > 0) this.cycle_next_queue();
	while(snow_Snow.defer_queue.length > 0) this.cycle_defer_queue();
	this.dispatch_event(2);
	snow_api_Promises.step();
	while(snow_Snow.next_queue.length > 0) this.cycle_next_queue();
	while(snow_Snow.defer_queue.length > 0) this.cycle_defer_queue();
	var _should_exit = this.runtime.run();
	if(_should_exit && !(this.has_shutdown || this.shutting_down)) this.shutdown();
};
$hxClasses["snow.Snow"] = snow_Snow;
snow_Snow.__name__ = ["snow","Snow"];
snow_Snow.__properties__ = {get_timestamp:"get_timestamp"}
snow_Snow.next = function(func) {
	if(func != null) snow_Snow.next_queue.push(func);
};
snow_Snow.defer = function(func) {
	if(func != null) snow_Snow.defer_queue.push(func);
};
snow_Snow.get_timestamp = function() {
	return window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
};
snow_Snow.prototype = {
	shutdown: function() {
		if(this.shutting_down) {
			haxe_Log.trace("     i / snow / " + "shutdown / called again, already shutting down - ignoring",{ fileName : "Snow.hx", lineNumber : 158, className : "snow.Snow", methodName : "shutdown"});
			return;
		}
		if(!(this.has_shutdown == false)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("has_shutdown == false" + (" ( " + "snow - calling shutdown more than once is disallowed" + " )")));
		this.shutting_down = true;
		this.host.ondestroy();
		this.dispatch_event(7);
		this.io.shutdown();
		this.audio.shutdown();
		this.assets.shutdown();
		this.input.shutdown();
		this.runtime.shutdown(this.immediate_shutdown);
		this.has_shutdown = true;
	}
	,dispatch_event: function(_type) {
		this.sys_event.set(_type,null,null);
		this.onevent(this.sys_event);
	}
	,dispatch_window_event: function(_type,_timestamp,_window_id,_x,_y) {
		this.win_event.set(_type,_timestamp,_window_id,_x,_y);
		this.sys_event.set(8,this.win_event,null);
		this.onevent(this.sys_event);
	}
	,dispatch_input_event: function(_event) {
		this.sys_event.set(9,null,_event);
		this.onevent(this.sys_event);
	}
	,onevent: function(_event) {
		this.io.module.onevent(_event);
		this.audio.onevent(_event);
		this.input.onevent(_event);
		this.host.onevent(_event);
		this.i = 0;
		while(this.i < this.extensions.length) {
			this.extensions[this.i].onevent(_event);
			++this.i;
		}
		var _g = _event.type;
		switch(_g) {
		case 2:
			this.on_ready_event();
			break;
		case 3:
			if(this.freeze) null; else {
				snow_api_Timer.update();
				snow_api_Promises.step();
				this.cycle_next_queue();
				if(!this.shutting_down && this.ready) this.host.internal_tick();
				this.cycle_defer_queue();
			}
			break;
		case 10:
			this.shutdown();
			break;
		case 7:
			haxe_Log.trace("     i / snow / " + "goodbye.",{ fileName : "Snow.hx", lineNumber : 237, className : "snow.Snow", methodName : "onevent"});
			break;
		case 11:
			this.immediate_shutdown = true;
			this.shutdown();
			break;
		default:
		}
	}
	,get_time: function() {
		return window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
	}
	,get_uniqueid: function() {
		return this.make_uniqueid();
	}
	,on_ready_event: function() {
		var _g = this;
		if(!(this.had_ready_event == false)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("had_ready_event == false" + (" ( " + "snow; the ready event should not be fired repeatedly" + " )")));
		this.had_ready_event = true;
		this.setup_configs().then(function(_) {
			_g.runtime.ready();
			_g.host.ready();
			_g.ready = true;
		}).error(function(e) {
			throw new js__$Boot_HaxeError(snow_types_Error.init("snow / cannot recover from error: " + e));
		});
		snow_api_Promises.step();
		while(snow_Snow.next_queue.length > 0) this.cycle_next_queue();
		while(snow_Snow.defer_queue.length > 0) this.cycle_defer_queue();
	}
	,on_tick_event: function() {
		if(this.freeze) return;
		snow_api_Timer.update();
		snow_api_Promises.step();
		this.cycle_next_queue();
		if(!this.shutting_down && this.ready) this.host.internal_tick();
		this.cycle_defer_queue();
	}
	,setup_configs: function() {
		var _g = this;
		if(snow_types_Config.app_config == null || snow_types_Config.app_config == "") {
			this.config = this.host.config(this.config);
			return snow_api_Promise.resolve();
		}
		return new snow_api_Promise(function(resolve,reject) {
			_g.default_user_config().then(function(_user_conf) {
				_g.config.user = _user_conf;
			}).error(function(error) {
				throw new js__$Boot_HaxeError(snow_types_Error.init("config / failed / default user config JSON failed to parse. Cannot recover. " + error));
			}).then(function() {
				_g.config = _g.host.config(_g.config);
				resolve();
			});
		});
	}
	,setup_host_config: function() {
		this.config = this.host.config(this.config);
	}
	,default_user_config: function() {
		var _g = this;
		return new snow_api_Promise(function(resolve,reject) {
			var load = _g.io.data_flow(haxe_io_Path.join([_g.assets.root,snow_types_Config.app_config]),snow_systems_assets_AssetJSON.processor);
			load.then(resolve).error(function(error) {
				switch(error[1]) {
				case 2:
					var val = error[2];
					reject(error);
					break;
				default:
					haxe_Log.trace("     i / snow / " + ("config / user config will be null! / " + Std.string(error)),{ fileName : "Snow.hx", lineNumber : 378, className : "snow.Snow", methodName : "default_user_config"});
					resolve(null);
				}
			});
		});
	}
	,default_config: function() {
		return { user : null, window : this.default_window_config(), render : this.default_render_config(), runtime : null};
	}
	,default_render_config: function() {
		return { depth : 0, stencil : 0, antialiasing : 0, red_bits : 8, green_bits : 8, blue_bits : 8, alpha_bits : 8, opengl : { major : 0, minor : 0, profile : 0}, webgl : { version : 1}};
	}
	,default_window_config: function() {
		var conf = { true_fullscreen : false, fullscreen : false, borderless : false, resizable : true, x : 536805376, y : 536805376, width : 960, height : 640, title : "snow app"};
		return conf;
	}
	,set_freeze: function(_freeze) {
		this.freeze = _freeze;
		this.dispatch_event(_freeze?4:5);
		return this.freeze;
	}
	,step: function() {
		snow_api_Promises.step();
		while(snow_Snow.next_queue.length > 0) this.cycle_next_queue();
		while(snow_Snow.defer_queue.length > 0) this.cycle_defer_queue();
	}
	,cycle_next_queue: function() {
		var count = snow_Snow.next_queue.length;
		var i = 0;
		while(i < count) {
			(snow_Snow.next_queue.shift())();
			++i;
		}
	}
	,cycle_defer_queue: function() {
		var count = snow_Snow.defer_queue.length;
		var i = 0;
		while(i < count) {
			(snow_Snow.defer_queue.shift())();
			++i;
		}
	}
	,copy_window_config: function(_config) {
		return { borderless : _config.borderless, fullscreen : _config.fullscreen, true_fullscreen : _config.true_fullscreen, height : _config.height, no_input : _config.no_input, resizable : _config.resizable, title : "" + _config.title, width : _config.width, x : _config.x, y : _config.y};
	}
	,copy_render_config: function(_config) {
		return { antialiasing : _config.antialiasing, depth : _config.depth, stencil : _config.stencil, red_bits : _config.red_bits, green_bits : _config.green_bits, blue_bits : _config.blue_bits, alpha_bits : _config.alpha_bits, opengl : { major : _config.opengl.major, minor : _config.opengl.minor, profile : _config.opengl.profile}};
	}
	,make_uniqueid: function(val) {
		if(val == null) val = Std.random(2147483647);
		var r = val % 62 | 0;
		var q = val / 62 | 0;
		if(q > 0) return this.make_uniqueid(q) + (r > 9?(function($this) {
			var $r;
			var ascii = 65 + (r - 10);
			if(ascii > 90) ascii += 6;
			$r = String.fromCharCode(ascii);
			return $r;
		}(this)):(r == null?"null":"" + r).charAt(0));
		return Std.string(r > 9?(function($this) {
			var $r;
			var ascii1 = 65 + (r - 10);
			if(ascii1 > 90) ascii1 += 6;
			$r = String.fromCharCode(ascii1);
			return $r;
		}(this)):(r == null?"null":"" + r).charAt(0));
	}
	,__class__: snow_Snow
	,__properties__: {get_uniqueid:"get_uniqueid",get_time:"get_time",set_freeze:"set_freeze"}
};
var snow_api__$Debug_LogError = $hxClasses["snow.api._Debug.LogError"] = { __ename__ : ["snow","api","_Debug","LogError"], __constructs__ : ["RequireString"] };
snow_api__$Debug_LogError.RequireString = function(detail) { var $x = ["RequireString",0,detail]; $x.__enum__ = snow_api__$Debug_LogError; $x.toString = $estr; return $x; };
var snow_api_Debug = function() { };
$hxClasses["snow.api.Debug"] = snow_api_Debug;
snow_api_Debug.__name__ = ["snow","api","Debug"];
snow_api_Debug._get_spacing = function(_file) {
	var _spaces = "";
	var _trace_length = _file.length + 4;
	var _diff = snow_api_Debug._log_width - _trace_length;
	if(_diff > 0) {
		var _g = 0;
		while(_g < _diff) {
			var i = _g++;
			_spaces += " ";
		}
	}
	return _spaces;
};
var snow_api_DebugError = $hxClasses["snow.api.DebugError"] = { __ename__ : ["snow","api","DebugError"], __constructs__ : ["assertion","null_assertion"] };
snow_api_DebugError.assertion = function(expr) { var $x = ["assertion",0,expr]; $x.__enum__ = snow_api_DebugError; $x.toString = $estr; return $x; };
snow_api_DebugError.null_assertion = function(expr) { var $x = ["null_assertion",1,expr]; $x.__enum__ = snow_api_DebugError; $x.toString = $estr; return $x; };
var snow_api_Emitter = function() {
	this._checking = false;
	this._to_remove = new List();
	this.connected = new List();
	this.bindings = new haxe_ds_IntMap();
};
$hxClasses["snow.api.Emitter"] = snow_api_Emitter;
snow_api_Emitter.__name__ = ["snow","api","Emitter"];
snow_api_Emitter.prototype = {
	emit: function(event,data) {
		this._check();
		var list = this.bindings.h[event];
		if(list != null && list.length > 0) {
			var _g = 0;
			while(_g < list.length) {
				var handler = list[_g];
				++_g;
				handler(data);
			}
		}
		this._check();
	}
	,on: function(event,handler) {
		this._check();
		if(!this.bindings.h.hasOwnProperty(event)) {
			this.bindings.h[event] = [handler];
			this.connected.push({ handler : handler, event : event});
		} else {
			var list = this.bindings.h[event];
			if(HxOverrides.indexOf(list,handler,0) == -1) {
				list.push(handler);
				this.connected.push({ handler : handler, event : event});
			}
		}
	}
	,off: function(event,handler) {
		this._check();
		var success = false;
		if(this.bindings.h.hasOwnProperty(event)) {
			this._to_remove.push({ event : event, handler : handler});
			var _g_head = this.connected.h;
			var _g_val = null;
			while(_g_head != null) {
				var _info;
				_info = (function($this) {
					var $r;
					_g_val = _g_head[0];
					_g_head = _g_head[1];
					$r = _g_val;
					return $r;
				}(this));
				if(_info.event == event && _info.handler == handler) this.connected.remove(_info);
			}
			success = true;
		}
		return success;
	}
	,_check: function() {
		if(this._checking) return;
		this._checking = true;
		if(this._to_remove.length > 0) {
			var _g_head = this._to_remove.h;
			var _g_val = null;
			while(_g_head != null) {
				var _node;
				_node = (function($this) {
					var $r;
					_g_val = _g_head[0];
					_g_head = _g_head[1];
					$r = _g_val;
					return $r;
				}(this));
				var list = this.bindings.h[_node.event];
				HxOverrides.remove(list,_node.handler);
				if(list.length == 0) this.bindings.remove(_node.event);
			}
			this._to_remove = null;
			this._to_remove = new List();
		}
		this._checking = false;
	}
	,__class__: snow_api_Emitter
};
var snow_api_Promise = function(func) {
	this.was_caught = false;
	var _g = this;
	this.state = 0;
	this.reject_reactions = [];
	this.fulfill_reactions = [];
	this.settle_reactions = [];
	snow_api_Promises.queue(function() {
		func($bind(_g,_g.onfulfill),$bind(_g,_g.onreject));
		snow_api_Promises.defer(snow_api_Promises.next);
	});
};
$hxClasses["snow.api.Promise"] = snow_api_Promise;
snow_api_Promise.__name__ = ["snow","api","Promise"];
snow_api_Promise.all = function(list) {
	return new snow_api_Promise(function(ok,no) {
		var current = 0;
		var total = list.length;
		var fulfill_result = [];
		var reject_result = null;
		var all_state = 0;
		var single_ok = function(index,val) {
			if(all_state != 0) return;
			current++;
			fulfill_result[index] = val;
			if(total == current) {
				all_state = 1;
				ok(fulfill_result);
			}
		};
		var single_err = function(val1) {
			if(all_state != 0) return;
			all_state = 2;
			reject_result = val1;
			no(reject_result);
		};
		var index1 = 0;
		var _g = 0;
		while(_g < list.length) {
			var promise = list[_g];
			++_g;
			promise.then((function(f,a1) {
				return function(a2) {
					f(a1,a2);
				};
			})(single_ok,index1)).error(single_err);
			index1++;
		}
	});
};
snow_api_Promise.race = function(list) {
	return new snow_api_Promise(function(ok,no) {
		var settled = false;
		var single_ok = function(val) {
			if(settled) return;
			settled = true;
			ok(val);
		};
		var single_err = function(val1) {
			if(settled) return;
			settled = true;
			no(val1);
		};
		var _g = 0;
		while(_g < list.length) {
			var promise = list[_g];
			++_g;
			promise.then(single_ok).error(single_err);
		}
	});
};
snow_api_Promise.reject = function(reason) {
	return new snow_api_Promise(function(ok,no) {
		no(reason);
	});
};
snow_api_Promise.resolve = function(val) {
	return new snow_api_Promise(function(ok,no) {
		ok(val);
	});
};
snow_api_Promise.prototype = {
	then: function(on_fulfilled,on_rejected) {
		var _g = this.state;
		switch(_g) {
		case 0:
			this.add_fulfill(on_fulfilled);
			this.add_reject(on_rejected);
			return this.new_linked_promise();
		case 1:
			snow_api_Promises.defer(on_fulfilled,this.result);
			return snow_api_Promise.resolve(this.result);
		case 2:
			snow_api_Promises.defer(on_rejected,this.result);
			return snow_api_Promise.reject(this.result);
		}
	}
	,error: function(on_rejected) {
		var _g = this.state;
		switch(_g) {
		case 0:
			this.add_reject(on_rejected);
			return this.new_linked_resolve_empty();
		case 1:
			return snow_api_Promise.resolve(this.result);
		case 2:
			snow_api_Promises.defer(on_rejected,this.result);
			return snow_api_Promise.reject(this.result);
		}
	}
	,toString: function() {
		return "Promise { state:" + this.state_string() + ", result:" + Std.string(this.result) + " }";
	}
	,add_settle: function(f) {
		if(this.state == 0) this.settle_reactions.push(f); else snow_api_Promises.defer(f,this.result);
	}
	,new_linked_promise: function() {
		var _g = this;
		return new snow_api_Promise(function(f,r) {
			_g.add_settle(function(_) {
				if(_g.state == 1) f(_g.result); else r(_g.result);
			});
		});
	}
	,new_linked_resolve: function() {
		var _g = this;
		return new snow_api_Promise(function(f,r) {
			_g.add_settle(function(val) {
				f(val);
			});
		});
	}
	,new_linked_reject: function() {
		var _g = this;
		return new snow_api_Promise(function(f,r) {
			_g.add_settle(function(val) {
				r(val);
			});
		});
	}
	,new_linked_resolve_empty: function() {
		var _g = this;
		return new snow_api_Promise(function(f,r) {
			_g.add_settle(function(_) {
				f();
			});
		});
	}
	,new_linked_reject_empty: function() {
		var _g = this;
		return new snow_api_Promise(function(f,r) {
			_g.add_settle(function(_) {
				r();
			});
		});
	}
	,add_fulfill: function(f) {
		if(f != null) this.fulfill_reactions.push(f);
	}
	,add_reject: function(f) {
		if(f != null) {
			this.was_caught = true;
			this.reject_reactions.push(f);
		}
	}
	,onfulfill: function(val) {
		this.state = 1;
		this.result = val;
		while(this.fulfill_reactions.length > 0) {
			var fn = this.fulfill_reactions.shift();
			fn(this.result);
		}
		this.onsettle();
	}
	,onreject: function(reason) {
		this.state = 2;
		this.result = reason;
		while(this.reject_reactions.length > 0) {
			var fn = this.reject_reactions.shift();
			fn(this.result);
		}
		this.onsettle();
	}
	,onsettle: function() {
		while(this.settle_reactions.length > 0) {
			var fn = this.settle_reactions.shift();
			fn(this.result);
		}
	}
	,onexception: function(err) {
		var _g = this;
		this.add_settle(function(_) {
			if(!_g.was_caught) {
				if(_g.state == 2) {
					throw new js__$Boot_HaxeError(snow_api_PromiseError.UnhandledPromiseRejection(_g.toString()));
					return;
				}
			}
		});
		if(this.state == 0) this.onreject(err);
	}
	,state_string: function() {
		var _g = this.state;
		switch(_g) {
		case 0:
			return "pending";
		case 1:
			return "fulfilled";
		case 2:
			return "rejected";
		}
	}
	,__class__: snow_api_Promise
};
var snow_api_Promises = function() { };
$hxClasses["snow.api.Promises"] = snow_api_Promises;
snow_api_Promises.__name__ = ["snow","api","Promises"];
snow_api_Promises.step = function() {
	snow_api_Promises.next();
	while(snow_api_Promises.defers.length > 0) {
		var defer = snow_api_Promises.defers.shift();
		defer.f(defer.a);
	}
};
snow_api_Promises.next = function() {
	if(snow_api_Promises.calls.length > 0) (snow_api_Promises.calls.shift())();
};
snow_api_Promises.defer = function(f,a) {
	if(f == null) return;
	snow_api_Promises.defers.push({ f : f, a : a});
};
snow_api_Promises.queue = function(f) {
	if(f == null) return;
	snow_api_Promises.calls.push(f);
};
var snow_api_PromiseError = $hxClasses["snow.api.PromiseError"] = { __ename__ : ["snow","api","PromiseError"], __constructs__ : ["UnhandledPromiseRejection"] };
snow_api_PromiseError.UnhandledPromiseRejection = function(err) { var $x = ["UnhandledPromiseRejection",0,err]; $x.__enum__ = snow_api_PromiseError; $x.toString = $estr; return $x; };
var snow_api_Timer = function(_time) {
	this.time = _time;
	snow_api_Timer.running_timers.push(this);
	this.fire_at = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start + this.time;
	this.running = true;
};
$hxClasses["snow.api.Timer"] = snow_api_Timer;
snow_api_Timer.__name__ = ["snow","api","Timer"];
snow_api_Timer.measure = function(f,pos) {
	var t0 = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
	var r = f();
	haxe_Log.trace(window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start - t0 + "s",pos);
	return r;
};
snow_api_Timer.update = function() {
	var now = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
	var _g = 0;
	var _g1 = snow_api_Timer.running_timers;
	while(_g < _g1.length) {
		var timer = _g1[_g];
		++_g;
		if(timer.running) {
			if(timer.fire_at < now) {
				timer.fire_at += timer.time;
				timer.run();
			}
		}
	}
};
snow_api_Timer.delay = function(_time,_f) {
	var t = new snow_api_Timer(_time);
	t.run = function() {
		t.stop();
		_f();
	};
	return t;
};
snow_api_Timer.prototype = {
	run: function() {
	}
	,stop: function() {
		if(this.running) {
			this.running = false;
			HxOverrides.remove(snow_api_Timer.running_timers,this);
		}
	}
	,__class__: snow_api_Timer
};
var snow_api_buffers__$Float32Array_Float32Array_$Impl_$ = {};
$hxClasses["snow.api.buffers._Float32Array.Float32Array_Impl_"] = snow_api_buffers__$Float32Array_Float32Array_$Impl_$;
snow_api_buffers__$Float32Array_Float32Array_$Impl_$.__name__ = ["snow","api","buffers","_Float32Array","Float32Array_Impl_"];
snow_api_buffers__$Float32Array_Float32Array_$Impl_$.fromBytes = function(bytes,byteOffset,len) {
	if(byteOffset == null) byteOffset = 0;
	if(byteOffset == null) return new Float32Array(bytes.b.bufferValue);
	if(len == null) return new Float32Array(bytes.b.bufferValue,byteOffset);
	return new Float32Array(bytes.b.bufferValue,byteOffset,len);
};
snow_api_buffers__$Float32Array_Float32Array_$Impl_$.toBytes = function(this1) {
	return new haxe_io_Bytes(new Uint8Array(this1.buffer));
};
snow_api_buffers__$Float32Array_Float32Array_$Impl_$.toString = function(this1) {
	return "Float32Array [byteLength:" + this1.byteLength + ", length:" + this1.length + "]";
};
var snow_api_buffers__$Int32Array_Int32Array_$Impl_$ = {};
$hxClasses["snow.api.buffers._Int32Array.Int32Array_Impl_"] = snow_api_buffers__$Int32Array_Int32Array_$Impl_$;
snow_api_buffers__$Int32Array_Int32Array_$Impl_$.__name__ = ["snow","api","buffers","_Int32Array","Int32Array_Impl_"];
snow_api_buffers__$Int32Array_Int32Array_$Impl_$.fromBytes = function(bytes,byteOffset,len) {
	if(byteOffset == null) byteOffset = 0;
	if(byteOffset == null) return new Int32Array(bytes.b.bufferValue);
	if(len == null) return new Int32Array(bytes.b.bufferValue,byteOffset);
	return new Int32Array(bytes.b.bufferValue,byteOffset,len);
};
snow_api_buffers__$Int32Array_Int32Array_$Impl_$.toBytes = function(this1) {
	return new haxe_io_Bytes(new Uint8Array(this1.buffer));
};
snow_api_buffers__$Int32Array_Int32Array_$Impl_$.toString = function(this1) {
	return "Int32Array [byteLength:" + this1.byteLength + ", length:" + this1.length + "]";
};
var snow_api_buffers__$Uint8Array_Uint8Array_$Impl_$ = {};
$hxClasses["snow.api.buffers._Uint8Array.Uint8Array_Impl_"] = snow_api_buffers__$Uint8Array_Uint8Array_$Impl_$;
snow_api_buffers__$Uint8Array_Uint8Array_$Impl_$.__name__ = ["snow","api","buffers","_Uint8Array","Uint8Array_Impl_"];
snow_api_buffers__$Uint8Array_Uint8Array_$Impl_$.fromBytes = function(bytes,byteOffset,len) {
	if(byteOffset == null) return new Uint8Array(bytes.b.bufferValue);
	if(len == null) return new Uint8Array(bytes.b.bufferValue,byteOffset);
	return new Uint8Array(bytes.b.bufferValue,byteOffset,len);
};
snow_api_buffers__$Uint8Array_Uint8Array_$Impl_$.toBytes = function(this1) {
	return new haxe_io_Bytes(new Uint8Array(this1.buffer));
};
snow_api_buffers__$Uint8Array_Uint8Array_$Impl_$.toString = function(this1) {
	return "Uint8Array [byteLength:" + this1.byteLength + ", length:" + this1.length + "]";
};
var snow_modules_interfaces_Audio = function() { };
$hxClasses["snow.modules.interfaces.Audio"] = snow_modules_interfaces_Audio;
snow_modules_interfaces_Audio.__name__ = ["snow","modules","interfaces","Audio"];
snow_modules_interfaces_Audio.prototype = {
	__class__: snow_modules_interfaces_Audio
};
var snow_core_Audio = function(_app) {
	this.active = false;
	this.app = _app;
};
$hxClasses["snow.core.Audio"] = snow_core_Audio;
snow_core_Audio.__name__ = ["snow","core","Audio"];
snow_core_Audio.__interfaces__ = [snow_modules_interfaces_Audio];
snow_core_Audio.audio_format_from_path = function(_path) {
	var _ext = haxe_io_Path.extension(_path);
	switch(_ext) {
	case "wav":
		return 3;
	case "ogg":
		return 2;
	case "pcm":
		return 4;
	default:
		return 0;
	}
};
snow_core_Audio.prototype = {
	onevent: function(event) {
	}
	,shutdown: function() {
	}
	,suspend: function() {
	}
	,resume: function() {
	}
	,data_from_load: function(_path,_is_stream,_format) {
		if(_is_stream == null) _is_stream = false;
		return null;
	}
	,data_from_bytes: function(_id,_bytes,_format) {
		return null;
	}
	,play: function(_source,_volume,_paused) {
		return null;
	}
	,loop: function(_source,_volume,_paused) {
		return null;
	}
	,pause: function(_handle) {
	}
	,unpause: function(_handle) {
	}
	,stop: function(_handle) {
	}
	,volume: function(_handle,_volume) {
	}
	,pan: function(_handle,_pan) {
	}
	,pitch: function(_handle,_pitch) {
	}
	,position: function(_handle,_time) {
	}
	,volume_of: function(_handle) {
		return 0.0;
	}
	,pan_of: function(_handle) {
		return 0.0;
	}
	,pitch_of: function(_handle) {
		return 0.0;
	}
	,position_of: function(_handle) {
		return 0.0;
	}
	,state_of: function(_handle) {
		return -1;
	}
	,loop_of: function(_handle) {
		return false;
	}
	,instance_of: function(_handle) {
		return null;
	}
	,__class__: snow_core_Audio
};
var snow_core_Extension = function() { };
$hxClasses["snow.core.Extension"] = snow_core_Extension;
snow_core_Extension.__name__ = ["snow","core","Extension"];
snow_core_Extension.prototype = {
	__class__: snow_core_Extension
};
var snow_core_Runtime = function() { };
$hxClasses["snow.core.Runtime"] = snow_core_Runtime;
snow_core_Runtime.__name__ = ["snow","core","Runtime"];
snow_core_Runtime.prototype = {
	__class__: snow_core_Runtime
};
var snow_core_web_Runtime = function(_app) {
	this.p_body_margin = "0";
	this.p_body_overflow = "0";
	this.p_height = 0;
	this.p_width = 0;
	this.p_s_height = "";
	this.p_s_width = "";
	this.p_margin = "0";
	this.p_padding = "0";
	this.gamepads_supported = false;
	this.window_dpr = 1.0;
	this.window_h = 0;
	this.window_w = 0;
	this.window_y = 0;
	this.window_x = 0;
	this.name = "web";
	this.app = _app;
	this.app.platform = "web";
	this.app.os = this.guess_os();
	snow_core_web_Runtime.timestamp_start = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
	this.app.config.runtime = { window_id : "app", window_parent : window.document.body, prevent_default_context_menu : true, prevent_default_mouse_wheel : true, prevent_default_touches : true, prevent_default_keys : [snow_systems_input_Keycodes.left,snow_systems_input_Keycodes.right,snow_systems_input_Keycodes.up,snow_systems_input_Keycodes.down,8,9,127]};
	this.gamepads_init();
	haxe_Log.trace("  i / runtime / " + "web / init ok",{ fileName : "Runtime.hx", lineNumber : 63, className : "snow.core.web.Runtime", methodName : "new"});
};
$hxClasses["snow.core.web.Runtime"] = snow_core_web_Runtime;
snow_core_web_Runtime.__name__ = ["snow","core","web","Runtime"];
snow_core_web_Runtime.__interfaces__ = [snow_core_Runtime];
snow_core_web_Runtime.timestamp = function() {
	return window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start;
};
snow_core_web_Runtime.prototype = {
	window_device_pixel_ratio: function() {
		if(window.devicePixelRatio == null) return 1.0; else return window.devicePixelRatio;
	}
	,window_width: function() {
		return this.window.width;
	}
	,window_height: function() {
		return this.window.height;
	}
	,window_grab: function(enable) {
		if(enable) {
			if(($_=this.window,$bind($_,$_.requestPointerLock)) != null) this.window.requestPointerLock(); else if(this.window.webkitRequestPointerLock != null) this.window.webkitRequestPointerLock(); else if(this.window.mozRequestPointerLock != null) this.window.mozRequestPointerLock(); else return false;
		} else if(($_=window.document,$bind($_,$_.exitPointerLock)) != null) window.document.exitPointerLock(); else if(window.document.webkitExitPointerLock != null) window.document.webkitExitPointerLock(); else if(window.document.mozExitPointerLock != null) window.document.mozExitPointerLock(); else return false;
		return true;
	}
	,onresize_handler: function(_) {
		this.window.style.width = "" + window.innerWidth + "px";
		this.window.style.height = "" + window.innerHeight + "px";
	}
	,window_fullscreen: function(enable,true_fullscreen) {
		if(true_fullscreen == null) true_fullscreen = false;
		var _result = true;
		if(enable) {
			this.p_padding = this.window.style.padding;
			this.p_margin = this.window.style.margin;
			this.p_s_width = this.window.style.width;
			this.p_s_height = this.window.style.height;
			this.p_width = this.window.width;
			this.p_height = this.window.height;
			this.p_body_margin = window.document.body.style.margin;
			this.p_body_overflow = window.document.body.style.overflow;
			this.window.style.margin = "0";
			this.window.style.padding = "0";
			this.window.style.width = window.innerWidth + "px";
			this.window.style.height = window.innerHeight + "px";
			this.window.width = window.innerWidth;
			this.window.height = window.innerHeight;
			window.document.body.style.margin = "0";
			window.document.body.style.overflow = "hidden";
			if(true_fullscreen) {
				if(($_=this.window,$bind($_,$_.requestFullscreen)) != null) this.window.requestFullscreen(); else if(this.window.requestFullScreen != null) this.window.requestFullScreen(null); else if(this.window.webkitRequestFullscreen != null) this.window.webkitRequestFullscreen(); else if(this.window.mozRequestFullScreen != null) this.window.mozRequestFullScreen(); else _result = false;
			}
			window.addEventListener("resize",$bind(this,this.onresize_handler));
		} else {
			window.removeEventListener("resize",$bind(this,this.onresize_handler));
			this.window.style.padding = this.p_padding;
			this.window.style.margin = this.p_margin;
			this.window.style.width = this.p_s_width;
			this.window.style.height = this.p_s_height;
			this.window.width = this.p_width;
			this.window.height = this.p_height;
			window.document.body.style.margin = this.p_body_margin;
			window.document.body.style.overflow = this.p_body_overflow;
			if(true_fullscreen) {
				if(($_=window.document,$bind($_,$_.exitFullscreen)) != null) window.document.exitFullscreen(); else if(window.document.webkitExitFullscreen != null) window.document.webkitExitFullscreen(); else if(window.document.mozCancelFullScreen != null) window.document.mozCancelFullScreen(); else _result = false;
			}
		}
		return _result;
	}
	,shutdown: function(_immediate) {
		if(_immediate == null) _immediate = false;
		haxe_Log.trace("  i / runtime / " + "runtime / web / shutdown",{ fileName : "Runtime.hx", lineNumber : 222, className : "snow.core.web.Runtime", methodName : "shutdown"});
	}
	,run: function() {
		haxe_Log.trace("  i / runtime / " + "web / run",{ fileName : "Runtime.hx", lineNumber : 228, className : "snow.core.web.Runtime", methodName : "run"});
		this.loop_pre_ready();
		return false;
	}
	,ready: function() {
		haxe_Log.trace("  i / runtime / " + "web / ready",{ fileName : "Runtime.hx", lineNumber : 238, className : "snow.core.web.Runtime", methodName : "ready"});
		this.create_window();
	}
	,dispatch_window_ev: function(_type,_x,_y) {
		this.app.dispatch_window_event(_type,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1,_x,_y);
	}
	,setup_events: function() {
		var _g = this;
		this.window.addEventListener("mouseleave",function(_ev) {
			_g.app.dispatch_window_event(11,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1,null,null);
		});
		this.window.addEventListener("mouseenter",function(_ev1) {
			_g.app.dispatch_window_event(10,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1,null,null);
		});
		window.document.addEventListener("visibilitychange",function(_) {
			if(window.document.hidden) {
				_g.app.dispatch_window_event(2,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1,null,null);
				_g.app.dispatch_window_event(7,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1,null,null);
				_g.app.dispatch_window_event(13,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1,null,null);
			} else {
				_g.app.dispatch_window_event(1,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1,null,null);
				_g.app.dispatch_window_event(9,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1,null,null);
				_g.app.dispatch_window_event(12,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1,null,null);
			}
		});
		window.document.addEventListener("keydown",function(_ev2) {
			var _keycode = _g.convert_keycode(_ev2.keyCode);
			var _scancode = snow_systems_input_Keycodes.to_scan(_keycode);
			var _mod_state = _g.mod_state_from_event(_ev2);
			if(HxOverrides.indexOf(_g.app.config.runtime.prevent_default_keys,_keycode,0) != -1) _ev2.preventDefault();
			_g.app.input.dispatch_key_down_event(_keycode,_scancode,_ev2.repeat,_mod_state,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1);
		});
		window.document.addEventListener("keyup",function(_ev3) {
			var _keycode1 = _g.convert_keycode(_ev3.keyCode);
			var _scancode1 = snow_systems_input_Keycodes.to_scan(_keycode1);
			var _mod_state1 = _g.mod_state_from_event(_ev3);
			if(HxOverrides.indexOf(_g.app.config.runtime.prevent_default_keys,_keycode1,0) != -1) _ev3.preventDefault();
			_g.app.input.dispatch_key_up_event(_keycode1,_scancode1,_ev3.repeat,_mod_state1,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1);
		});
		var _ignored = [8,13];
		window.document.addEventListener("keypress",function(_ev4) {
			if(_ev4.which != 0 && HxOverrides.indexOf(_ignored,_ev4.keyCode,0) == -1) {
				var _text = String.fromCharCode(_ev4.charCode);
				_g.app.input.dispatch_text_event(_text,0,_text.length,2,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1);
			}
		});
		this.window.addEventListener("contextmenu",function(_ev5) {
			if(_g.app.config.runtime.prevent_default_context_menu) _ev5.preventDefault();
		});
		this.window.addEventListener("mousedown",function(_ev6) {
			_g.app.input.dispatch_mouse_down_event(Math.floor(_g.window_dpr * (_ev6.pageX - _g.window_x)),Math.floor(_g.window_dpr * (_ev6.pageY - _g.window_y)),_ev6.button + 1,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1);
		});
		this.window.addEventListener("mouseup",function(_ev7) {
			_g.app.input.dispatch_mouse_up_event(Math.floor(_g.window_dpr * (_ev7.pageX - _g.window_x)),Math.floor(_g.window_dpr * (_ev7.pageY - _g.window_y)),_ev7.button + 1,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1);
		});
		this.window.addEventListener("mousemove",function(_ev8) {
			var _movement_x;
			if(_ev8.movementX == null) _movement_x = 0; else _movement_x = _ev8.movementX;
			var _movement_y;
			if(_ev8.movementY == null) _movement_y = 0; else _movement_y = _ev8.movementY;
			_movement_x = Math.floor(_movement_x * _g.window_dpr);
			_movement_y = Math.floor(_movement_y * _g.window_dpr);
			_g.app.input.dispatch_mouse_move_event(Math.floor(_g.window_dpr * (_ev8.pageX - _g.window_x)),Math.floor(_g.window_dpr * (_ev8.pageY - _g.window_y)),_movement_x,_movement_y,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1);
		});
		this.window.addEventListener("wheel",function(_ev9) {
			if(_g.app.config.runtime.prevent_default_mouse_wheel) _ev9.preventDefault();
			_g.app.input.dispatch_mouse_wheel_event(_ev9.deltaX,_ev9.deltaY,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1);
		});
		this.window.addEventListener("touchstart",function(_ev10) {
			if(_g.app.config.runtime.prevent_default_touches) _ev10.preventDefault();
			var _bound = _g.window.getBoundingClientRect();
			var _g1 = 0;
			var _g2 = _ev10.changedTouches;
			while(_g1 < _g2.length) {
				var touch = _g2[_g1];
				++_g1;
				var _x = touch.clientX - _bound.left;
				var _y = touch.clientY - _bound.top;
				_x = _x / _bound.width;
				_y = _y / _bound.height;
				_g.app.input.dispatch_touch_down_event(_x,_y,0,0,touch.identifier,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start);
			}
		});
		this.window.addEventListener("touchend",function(_ev11) {
			if(_g.app.config.runtime.prevent_default_touches) _ev11.preventDefault();
			var _bound1 = _g.window.getBoundingClientRect();
			var _g11 = 0;
			var _g21 = _ev11.changedTouches;
			while(_g11 < _g21.length) {
				var touch1 = _g21[_g11];
				++_g11;
				var _x1 = touch1.clientX - _bound1.left;
				var _y1 = touch1.clientY - _bound1.top;
				_x1 = _x1 / _bound1.width;
				_y1 = _y1 / _bound1.height;
				_g.app.input.dispatch_touch_up_event(_x1,_y1,0,0,touch1.identifier,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start);
			}
		});
		this.window.addEventListener("touchmove",function(_ev12) {
			if(_g.app.config.runtime.prevent_default_touches) _ev12.preventDefault();
			var _bound2 = _g.window.getBoundingClientRect();
			var _g12 = 0;
			var _g22 = _ev12.changedTouches;
			while(_g12 < _g22.length) {
				var touch2 = _g22[_g12];
				++_g12;
				var _x2 = touch2.clientX - _bound2.left;
				var _y2 = touch2.clientY - _bound2.top;
				_x2 = _x2 / _bound2.width;
				_y2 = _y2 / _bound2.height;
				_g.app.input.dispatch_touch_move_event(_x2,_y2,0,0,touch2.identifier,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start);
			}
		});
		window.addEventListener("gamepadconnected",function(_ev13) {
			_g.gamepads_init_cache(_ev13.gamepad);
			_g.app.input.dispatch_gamepad_device_event(_ev13.gamepad.index,_ev13.gamepad.id,1,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start);
		});
		window.addEventListener("gamepaddisconnected",function(_ev14) {
			_g.gamepad_btns_cache[_ev14.gamepad.index] = null;
			_g.app.input.dispatch_gamepad_device_event(_ev14.gamepad.index,_ev14.gamepad.id,2,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start);
		});
	}
	,create_window: function() {
		var config = this.app.config.window;
		var _this = window.document;
		this.window = _this.createElement("canvas");
		if(window.devicePixelRatio == null) this.window_dpr = 1.0; else this.window_dpr = window.devicePixelRatio;
		this.window.width = Math.floor(config.width * this.window_dpr);
		this.window.height = Math.floor(config.height * this.window_dpr);
		this.window_w = config.width;
		this.window_h = config.width;
		this.window.style.width = config.width + "px";
		this.window.style.height = config.height + "px";
		this.window.style.background = "#000";
		this.window.id = this.app.config.runtime.window_id;
		this.app.config.runtime.window_parent.appendChild(this.window);
		if(config.title != null) window.document.title = config.title;
		if(!this.create_render_context(this.window)) {
			this.create_render_context_failed();
			return;
		}
		this.setup_events();
		if(config.fullscreen) {
			this.window_fullscreen(true,config.true_fullscreen);
			this.update_window_bounds();
		}
	}
	,create_render_context: function(_window) {
		var config = this.app.config.render;
		var attr = config.webgl;
		attr = this.apply_GL_attr(config,attr);
		var _gl = null;
		if(config.webgl.version != 1) {
			_gl = this.window.getContext("webgl" + config.webgl.version);
			if(_gl == null) _gl = this.window.getContext("experimental-webgl" + config.webgl.version);
		} else _gl = js_html__$CanvasElement_CanvasUtil.getContextWebGL(this.window,attr);
		snow_modules_opengl_web_GL.gl = _gl;
		haxe_Log.trace("  i / runtime / " + ("web / GL / context(" + Std.string(_gl) + ")"),{ fileName : "Runtime.hx", lineNumber : 606, className : "snow.core.web.Runtime", methodName : "create_render_context"});
		return _gl != null;
	}
	,apply_GL_attr: function(render,attr) {
		if(attr.alpha == null) attr.alpha = false;
		attr.alpha = attr.alpha;
		if(attr.premultipliedAlpha == null) attr.premultipliedAlpha = false;
		attr.premultipliedAlpha = attr.premultipliedAlpha;
		if(attr.antialias == null) attr.antialias = this.app.config.render.antialiasing > 0;
		attr.antialias = attr.antialias;
		if(attr.depth == null) attr.depth = this.app.config.render.depth > 0;
		attr.depth = attr.depth;
		if(attr.stencil == null) attr.stencil = this.app.config.render.stencil > 0;
		attr.stencil = attr.stencil;
		return attr;
	}
	,create_render_context_failed: function() {
		var msg = "WebGL is required to run this!<br/><br/>";
		msg += "visit <a style=\"color:#06b4fb; text-decoration:none;\" href=\"http://get.webgl.org/\">get.webgl.com</a> for info<br/>";
		msg += "and contact the developer of this app";
		var text_el;
		var overlay_el;
		var _this = window.document;
		text_el = _this.createElement("div");
		var _this1 = window.document;
		overlay_el = _this1.createElement("div");
		text_el.style.marginLeft = "auto";
		text_el.style.marginRight = "auto";
		text_el.style.color = "#d3d3d3";
		text_el.style.marginTop = "5em";
		text_el.style.fontSize = "1.4em";
		text_el.style.fontFamily = "helvetica,sans-serif";
		text_el.innerHTML = msg;
		overlay_el.style.top = "0";
		overlay_el.style.left = "0";
		overlay_el.style.width = "100%";
		overlay_el.style.height = "100%";
		overlay_el.style.display = "block";
		overlay_el.style.minWidth = "100%";
		overlay_el.style.minHeight = "100%";
		overlay_el.style.textAlign = "center";
		overlay_el.style.position = "absolute";
		overlay_el.style.background = "rgba(1,1,1,0.90)";
		overlay_el.appendChild(text_el);
		window.document.body.appendChild(overlay_el);
		throw new js__$Boot_HaxeError(snow_types_Error.error("runtime / web / failed to create render context, unable to recover"));
	}
	,request_frame: function() {
		window.requestAnimationFrame($bind(this,this.loop));
	}
	,loop: function(_t) {
		if(_t == null) _t = 0.016;
		if(this.gamepads_supported) this.gamepads_poll();
		this.update_window_bounds();
		this.app.dispatch_event(3);
		if(!this.app.shutting_down) window.requestAnimationFrame($bind(this,this.loop));
		return true;
	}
	,loop_pre_ready: function(_t) {
		if(_t == null) _t = 0.016;
		this.app.dispatch_event(3);
		if(!this.app.shutting_down) {
			if(!this.app.ready) window.requestAnimationFrame($bind(this,this.loop_pre_ready)); else window.requestAnimationFrame($bind(this,this.loop));
		}
		return true;
	}
	,mod_state_from_event: function(_key_event) {
		var _none = !_key_event.altKey && !_key_event.ctrlKey && !_key_event.metaKey && !_key_event.shiftKey;
		this.app.input.mod_state.none = _none;
		this.app.input.mod_state.lshift = _key_event.shiftKey;
		this.app.input.mod_state.rshift = _key_event.shiftKey;
		this.app.input.mod_state.lctrl = _key_event.ctrlKey;
		this.app.input.mod_state.rctrl = _key_event.ctrlKey;
		this.app.input.mod_state.lalt = _key_event.altKey;
		this.app.input.mod_state.ralt = _key_event.altKey;
		this.app.input.mod_state.lmeta = _key_event.metaKey;
		this.app.input.mod_state.rmeta = _key_event.metaKey;
		this.app.input.mod_state.num = false;
		this.app.input.mod_state.caps = false;
		this.app.input.mod_state.mode = false;
		this.app.input.mod_state.ctrl = _key_event.ctrlKey;
		this.app.input.mod_state.shift = _key_event.shiftKey;
		this.app.input.mod_state.alt = _key_event.altKey;
		this.app.input.mod_state.meta = _key_event.metaKey;
		return this.app.input.mod_state;
	}
	,convert_keycode: function(dom_keycode) {
		if(dom_keycode >= 65 && dom_keycode <= 90) return dom_keycode + 32;
		return snow_core_web__$Runtime_DOMKeys.dom_key_to_keycode(dom_keycode);
	}
	,get_window_x: function(_bounds) {
		return Math.round(_bounds.left + window.pageXOffset - window.document.body.clientTop);
	}
	,get_window_y: function(_bounds) {
		return Math.round(_bounds.top + window.pageYOffset - window.document.body.clientLeft);
	}
	,update_window_bounds: function() {
		if(window.devicePixelRatio == null) this.window_dpr = 1.0; else this.window_dpr = window.devicePixelRatio;
		var _bounds = this.window.getBoundingClientRect();
		var _x = Math.round(_bounds.left + window.pageXOffset - window.document.body.clientTop);
		var _y = Math.round(_bounds.top + window.pageYOffset - window.document.body.clientLeft);
		var _w = Math.round(_bounds.width);
		var _h = Math.round(_bounds.height);
		if(_x != this.window_x || _y != this.window_y) {
			this.window_x = _x;
			this.window_y = _y;
			this.app.dispatch_window_event(4,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1,this.window_x,this.window_y);
		}
		if(_w != this.window_w || _h != this.window_h) {
			this.window_w = _w;
			this.window_h = _h;
			this.window.width = Math.floor(this.window_w * this.window_dpr);
			this.window.height = Math.floor(this.window_h * this.window_dpr);
			this.app.dispatch_window_event(6,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start,1,this.window.width,this.window.height);
		}
	}
	,gamepads_init_cache: function(_gamepad) {
		this.gamepad_btns_cache[_gamepad.index] = [];
		var _g1 = 0;
		var _g = _gamepad.buttons.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.gamepad_btns_cache[_gamepad.index].push(0);
		}
	}
	,gamepads_init: function() {
		var _list;
		if(($_=window.navigator,$bind($_,$_.getGamepads)) != null) _list = window.navigator.getGamepads(); else if(window.navigator.webkitGetGamepads != null) _list = window.navigator.webkitGetGamepads(); else _list = null;
		if(_list != null) {
			this.gamepads_supported = true;
			this.gamepad_btns_cache = [];
			var _g = 0;
			while(_g < _list.length) {
				var _gamepad = _list[_g];
				++_g;
				if(_gamepad != null) this.gamepads_init_cache(_gamepad);
			}
		} else haxe_Log.trace("  i / runtime / " + "Gamepads are not supported in this browser :(",{ fileName : "Runtime.hx", lineNumber : 813, className : "snow.core.web.Runtime", methodName : "gamepads_init"});
	}
	,gamepads_poll: function() {
		var list;
		if(($_=window.navigator,$bind($_,$_.getGamepads)) != null) list = window.navigator.getGamepads(); else if(window.navigator.webkitGetGamepads != null) list = window.navigator.webkitGetGamepads(); else list = null;
		if(list == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("list was null" + (" ( " + "gamepad list not found, but they were previously?" + " )")));
		var _count = list.length;
		var _idx = 0;
		while(_idx < _count) {
			var _gamepad = list[_idx];
			if(_gamepad == null) {
				_idx++;
				continue;
			}
			var _g1 = 0;
			var _g = _gamepad.axes.length;
			while(_g1 < _g) {
				var _axis_idx = _g1++;
				var _axis = _gamepad.axes[_axis_idx];
				if(_axis != 0) this.app.input.dispatch_gamepad_axis_event(_gamepad.index,_axis_idx,_axis,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start);
			}
			var _prev_btn = this.gamepad_btns_cache[_gamepad.index];
			var _g11 = 0;
			var _g2 = _gamepad.buttons.length;
			while(_g11 < _g2) {
				var _btn_idx = _g11++;
				var _btn = _gamepad.buttons[_btn_idx];
				if(_btn.value != _prev_btn[_btn_idx]) {
					if(_btn.pressed) this.app.input.dispatch_gamepad_button_down_event(_gamepad.index,_btn_idx,_btn.value,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start); else this.app.input.dispatch_gamepad_button_up_event(_gamepad.index,_btn_idx,_btn.value,window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start);
					_prev_btn[_btn_idx] = _btn.value;
				}
			}
			_idx++;
		}
	}
	,gamepads_get_list: function() {
		if(($_=window.navigator,$bind($_,$_.getGamepads)) != null) return window.navigator.getGamepads();
		if(window.navigator.webkitGetGamepads != null) return window.navigator.webkitGetGamepads();
		return null;
	}
	,guess_os: function() {
		var _ver = window.navigator.appVersion;
		var _agent = window.navigator.userAgent;
		if((function($this) {
			var $r;
			var r = new EReg("mac","gi");
			$r = r.match(_ver);
			return $r;
		}(this))) return "mac";
		if((function($this) {
			var $r;
			var r1 = new EReg("win","gi");
			$r = r1.match(_ver);
			return $r;
		}(this))) return "windows";
		if((function($this) {
			var $r;
			var r2 = new EReg("x11","gi");
			$r = r2.match(_ver);
			return $r;
		}(this))) return "linux";
		if((function($this) {
			var $r;
			var r3 = new EReg("linux","gi");
			$r = r3.match(_ver);
			return $r;
		}(this))) return "linux";
		if((function($this) {
			var $r;
			var r4 = new EReg("android","gi");
			$r = r4.match(_ver);
			return $r;
		}(this))) return "android";
		if((function($this) {
			var $r;
			var r5 = new EReg("ipad","gi");
			$r = r5.match(_agent);
			return $r;
		}(this))) return "ios";
		if((function($this) {
			var $r;
			var r6 = new EReg("iphone","gi");
			$r = r6.match(_agent);
			return $r;
		}(this))) return "ios";
		if((function($this) {
			var $r;
			var r7 = new EReg("ipod","gi");
			$r = r7.match(_agent);
			return $r;
		}(this))) return "ios";
		return "unknown";
	}
	,__class__: snow_core_web_Runtime
};
var snow_core_web__$Runtime_DOMKeys = function() { };
$hxClasses["snow.core.web._Runtime.DOMKeys"] = snow_core_web__$Runtime_DOMKeys;
snow_core_web__$Runtime_DOMKeys.__name__ = ["snow","core","web","_Runtime","DOMKeys"];
snow_core_web__$Runtime_DOMKeys.dom_key_to_keycode = function(_keycode) {
	switch(_keycode) {
	case 16:
		return snow_systems_input_Keycodes.lshift;
	case 17:
		return snow_systems_input_Keycodes.lctrl;
	case 18:
		return snow_systems_input_Keycodes.lalt;
	case 20:
		return snow_systems_input_Keycodes.capslock;
	case 33:
		return snow_systems_input_Keycodes.pageup;
	case 34:
		return snow_systems_input_Keycodes.pagedown;
	case 35:
		return snow_systems_input_Keycodes.end;
	case 36:
		return snow_systems_input_Keycodes.home;
	case 37:
		return snow_systems_input_Keycodes.left;
	case 38:
		return snow_systems_input_Keycodes.up;
	case 39:
		return snow_systems_input_Keycodes.right;
	case 40:
		return snow_systems_input_Keycodes.down;
	case 44:
		return snow_systems_input_Keycodes.printscreen;
	case 45:
		return snow_systems_input_Keycodes.insert;
	case 46:
		return 127;
	case 91:
		return snow_systems_input_Keycodes.lmeta;
	case 93:
		return snow_systems_input_Keycodes.rmeta;
	case 224:
		return snow_systems_input_Keycodes.lmeta;
	case 96:
		return snow_systems_input_Keycodes.kp_0;
	case 97:
		return snow_systems_input_Keycodes.kp_1;
	case 98:
		return snow_systems_input_Keycodes.kp_2;
	case 99:
		return snow_systems_input_Keycodes.kp_3;
	case 100:
		return snow_systems_input_Keycodes.kp_4;
	case 101:
		return snow_systems_input_Keycodes.kp_5;
	case 102:
		return snow_systems_input_Keycodes.kp_6;
	case 103:
		return snow_systems_input_Keycodes.kp_7;
	case 104:
		return snow_systems_input_Keycodes.kp_8;
	case 105:
		return snow_systems_input_Keycodes.kp_9;
	case 106:
		return snow_systems_input_Keycodes.kp_multiply;
	case 107:
		return snow_systems_input_Keycodes.kp_plus;
	case 109:
		return snow_systems_input_Keycodes.kp_minus;
	case 110:
		return snow_systems_input_Keycodes.kp_decimal;
	case 111:
		return snow_systems_input_Keycodes.kp_divide;
	case 144:
		return snow_systems_input_Keycodes.numlockclear;
	case 112:
		return snow_systems_input_Keycodes.f1;
	case 113:
		return snow_systems_input_Keycodes.f2;
	case 114:
		return snow_systems_input_Keycodes.f3;
	case 115:
		return snow_systems_input_Keycodes.f4;
	case 116:
		return snow_systems_input_Keycodes.f5;
	case 117:
		return snow_systems_input_Keycodes.f6;
	case 118:
		return snow_systems_input_Keycodes.f7;
	case 119:
		return snow_systems_input_Keycodes.f8;
	case 120:
		return snow_systems_input_Keycodes.f9;
	case 121:
		return snow_systems_input_Keycodes.f10;
	case 122:
		return snow_systems_input_Keycodes.f11;
	case 123:
		return snow_systems_input_Keycodes.f12;
	case 124:
		return snow_systems_input_Keycodes.f13;
	case 125:
		return snow_systems_input_Keycodes.f14;
	case 126:
		return snow_systems_input_Keycodes.f15;
	case 127:
		return snow_systems_input_Keycodes.f16;
	case 128:
		return snow_systems_input_Keycodes.f17;
	case 129:
		return snow_systems_input_Keycodes.f18;
	case 130:
		return snow_systems_input_Keycodes.f19;
	case 131:
		return snow_systems_input_Keycodes.f20;
	case 132:
		return snow_systems_input_Keycodes.f21;
	case 133:
		return snow_systems_input_Keycodes.f22;
	case 134:
		return snow_systems_input_Keycodes.f23;
	case 135:
		return snow_systems_input_Keycodes.f24;
	case 160:
		return 94;
	case 161:
		return 33;
	case 162:
		return 34;
	case 163:
		return 35;
	case 164:
		return 36;
	case 165:
		return 37;
	case 166:
		return 38;
	case 167:
		return 95;
	case 168:
		return 40;
	case 169:
		return 41;
	case 170:
		return 42;
	case 171:
		return 43;
	case 172:
		return 92;
	case 173:
		return 45;
	case 174:
		return 91;
	case 175:
		return 93;
	case 176:
		return 96;
	case 181:
		return snow_systems_input_Keycodes.audiomute;
	case 182:
		return snow_systems_input_Keycodes.volumedown;
	case 183:
		return snow_systems_input_Keycodes.volumeup;
	case 188:
		return 44;
	case 190:
		return 46;
	case 191:
		return 47;
	case 192:
		return 96;
	case 219:
		return 91;
	case 221:
		return 93;
	case 220:
		return 92;
	case 222:
		return 39;
	}
	return _keycode;
};
var snow_modules_interfaces_Assets = function() { };
$hxClasses["snow.modules.interfaces.Assets"] = snow_modules_interfaces_Assets;
snow_modules_interfaces_Assets.__name__ = ["snow","modules","interfaces","Assets"];
snow_modules_interfaces_Assets.prototype = {
	__class__: snow_modules_interfaces_Assets
};
var snow_core_web_assets_Assets = function(_app) {
	this.app = _app;
};
$hxClasses["snow.core.web.assets.Assets"] = snow_core_web_assets_Assets;
snow_core_web_assets_Assets.__name__ = ["snow","core","web","assets","Assets"];
snow_core_web_assets_Assets.__interfaces__ = [snow_modules_interfaces_Assets];
snow_core_web_assets_Assets.prototype = {
	onevent: function(event) {
	}
	,shutdown: function() {
	}
	,image_info_from_load: function(_id,_components) {
		if(_components == null) _components = 4;
		return this.app.io.data_flow(_id,snow_systems_assets_AssetImage.processor);
	}
	,image_info_from_element: function(_id,_elem) {
		var width_pot = this.nearest_power_of_two(_elem.width);
		var height_pot = this.nearest_power_of_two(_elem.height);
		var image_bytes = this.POT_bytes_from_element(_elem.width,_elem.height,width_pot,height_pot,_elem);
		var info = new snow_types_ImageData(this.app,{ id : _id, bpp : 4, width : _elem.width, height : _elem.height, width_actual : width_pot, height_actual : height_pot, bpp_source : 4, pixels : image_bytes});
		image_bytes = null;
		return info;
	}
	,image_info_from_pixels: function(_id,_width,_height,_pixels,_bpp) {
		if(_bpp == null) _bpp = 4;
		var info = new snow_types_ImageData(this.app,{ id : _id, bpp : 4, width : _width, height : _height, width_actual : _width, height_actual : _height, bpp_source : 4, pixels : _pixels});
		return info;
	}
	,image_info_from_bytes: function(_id,_bytes,_components) {
		if(_components == null) _components = 4;
		var _g = this;
		if(_id == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_id was null" + ""));
		if(_bytes == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_bytes was null" + ""));
		if(!(_bytes.length != 0)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("_bytes.length != 0" + ""));
		var ext = haxe_io_Path.extension(_id);
		return new snow_api_Promise(function(resolve,reject) {
			var str = "";
			var i = 0;
			var len = _bytes.length;
			while(i < len) str += String.fromCharCode((function($this) {
				var $r;
				var a;
				{
					var idx = i++;
					a = _bytes[idx];
				}
				$r = a & 255;
				return $r;
			}(this)));
			var b64 = window.btoa(str);
			var src = "data:image/" + ext + ";base64," + b64;
			var _img = new Image();
			_img.onload = function(_) {
				var info = _g.image_info_from_element(_id,_img);
				resolve(info);
			};
			_img.onerror = function(e) {
				reject(snow_types_Error.error("failed to load image from bytes, on error: " + e));
			};
			_img.src = src;
		});
	}
	,POT_bytes_from_pixels: function(_width,_height,_width_pot,_height_pot,_source) {
		var tmp_canvas;
		var _this = window.document;
		tmp_canvas = _this.createElement("canvas");
		tmp_canvas.width = _width_pot;
		tmp_canvas.height = _height_pot;
		var tmp_context = tmp_canvas.getContext("2d",null);
		tmp_context.clearRect(0,0,tmp_canvas.width,tmp_canvas.height);
		var image_bytes = null;
		var _pixels = new Uint8ClampedArray(_source.buffer);
		var _imgdata = tmp_context.createImageData(_width,_height);
		_imgdata.data.set(_pixels);
		try {
			tmp_context.putImageData(_imgdata,0,0);
			image_bytes = tmp_context.getImageData(0,0,tmp_canvas.width,tmp_canvas.height);
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			var tips = "- textures served from file:/// throw security errors\n";
			tips += "- textures served over http:// work for cross origin byte requests";
			haxe_Log.trace("   i / assets / " + tips,{ fileName : "Assets.hx", lineNumber : 183, className : "snow.core.web.assets.Assets", methodName : "POT_bytes_from_pixels"});
			throw new js__$Boot_HaxeError(e);
		}
		tmp_canvas = null;
		tmp_context = null;
		_imgdata = null;
		var view = image_bytes.data;
		var this1;
		if(view != null) this1 = new Uint8Array(view); else this1 = null;
		return this1;
	}
	,POT_bytes_from_element: function(_width,_height,_width_pot,_height_pot,_source) {
		var tmp_canvas;
		var _this = window.document;
		tmp_canvas = _this.createElement("canvas");
		tmp_canvas.width = _width_pot;
		tmp_canvas.height = _height_pot;
		var tmp_context = tmp_canvas.getContext("2d",null);
		tmp_context.clearRect(0,0,tmp_canvas.width,tmp_canvas.height);
		tmp_context.drawImage(_source,0,0,_width,_height);
		var image_bytes = null;
		try {
			image_bytes = tmp_context.getImageData(0,0,tmp_canvas.width,tmp_canvas.height);
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			var tips = "- textures served from file:/// throw security errors\n";
			tips += "- textures served over http:// work for cross origin byte requests";
			haxe_Log.trace("   i / assets / " + tips,{ fileName : "Assets.hx", lineNumber : 221, className : "snow.core.web.assets.Assets", methodName : "POT_bytes_from_element"});
			throw new js__$Boot_HaxeError(e);
		}
		tmp_canvas = null;
		tmp_context = null;
		var view = image_bytes.data;
		var this1;
		if(view != null) this1 = new Uint8Array(view); else this1 = null;
		return this1;
	}
	,nearest_power_of_two: function(_value) {
		if(!snow_core_web_assets_Assets.POT) return _value;
		_value--;
		_value |= _value >> 1;
		_value |= _value >> 2;
		_value |= _value >> 4;
		_value |= _value >> 8;
		_value |= _value >> 16;
		_value++;
		return _value;
	}
	,__class__: snow_core_web_assets_Assets
};
var snow_modules_interfaces_IO = function() { };
$hxClasses["snow.modules.interfaces.IO"] = snow_modules_interfaces_IO;
snow_modules_interfaces_IO.__name__ = ["snow","modules","interfaces","IO"];
snow_modules_interfaces_IO.prototype = {
	__class__: snow_modules_interfaces_IO
};
var snow_core_web_io_IO = function(_app) {
	this.app = _app;
};
$hxClasses["snow.core.web.io.IO"] = snow_core_web_io_IO;
snow_core_web_io_IO.__name__ = ["snow","core","web","io","IO"];
snow_core_web_io_IO.__interfaces__ = [snow_modules_interfaces_IO];
snow_core_web_io_IO.prototype = {
	shutdown: function() {
	}
	,onevent: function(_event) {
	}
	,app_path: function() {
		return "./";
	}
	,app_path_prefs: function() {
		return "./";
	}
	,url_open: function(_url) {
		if(_url != null && _url.length > 0) window.open(_url,"_blank");
	}
	,data_load: function(_path,_options) {
		return new snow_api_Promise(function(resolve,reject) {
			var _async = true;
			var _binary = true;
			if(_options != null) {
				if(_options.binary != null) _binary = _options.binary;
			}
			var request = new XMLHttpRequest();
			request.open("GET",_path,_async);
			if(_binary) request.overrideMimeType("text/plain; charset=x-user-defined"); else request.overrideMimeType("text/plain; charset=UTF-8");
			if(_async) request.responseType = "arraybuffer";
			request.onload = function(data) {
				if(request.status == 200) resolve((function($this) {
					var $r;
					var elements = request.response;
					var this1;
					if(elements != null) this1 = new Uint8Array(elements); else this1 = null;
					$r = this1;
					return $r;
				}(this))); else reject(snow_types_Error.error("request status was " + request.status + " / " + request.statusText));
			};
			request.send();
		});
	}
	,data_save: function(_path,_data,_options) {
		return false;
	}
	,string_save_path: function(_slot) {
		if(_slot == null) _slot = 0;
		var _pref_path = "<localstorage>";
		var _slot_path = this.string_slot_id(_slot);
		var _path = haxe_io_Path.join([_pref_path,_slot_path]);
		return haxe_io_Path.normalize(_path);
	}
	,string_slot_id: function(_slot) {
		if(_slot == null) _slot = 0;
		var _parts = snow_types_Config.app_ident.split(".");
		var _appname = _parts.pop();
		var _org = _parts.join(".");
		return "" + _org + "/" + _appname + "/" + this.app.io.string_save_prefix + "." + _slot;
	}
	,string_slot_destroy: function(_slot) {
		if(_slot == null) _slot = 0;
		var storage = window.localStorage;
		if(storage == null) {
			haxe_Log.trace("       i / io / " + "localStorage isnt supported in this browser?!",{ fileName : "IO.hx", lineNumber : 119, className : "snow.core.web.io.IO", methodName : "string_slot_destroy"});
			return false;
		}
		var _id = this.string_slot_id(_slot);
		storage.removeItem(_id);
		return false;
	}
	,string_slot_save: function(_slot,_contents) {
		if(_slot == null) _slot = 0;
		var storage = window.localStorage;
		if(storage == null) {
			haxe_Log.trace("       i / io / " + "localStorage isnt supported in this browser?!",{ fileName : "IO.hx", lineNumber : 136, className : "snow.core.web.io.IO", methodName : "string_slot_save"});
			return false;
		}
		var _id = this.string_slot_id(_slot);
		storage.setItem(_id,_contents);
		return true;
	}
	,string_slot_load: function(_slot) {
		if(_slot == null) _slot = 0;
		var storage = window.localStorage;
		if(storage == null) {
			haxe_Log.trace("       i / io / " + "localStorage isnt supported in this browser?!",{ fileName : "IO.hx", lineNumber : 154, className : "snow.core.web.io.IO", methodName : "string_slot_load"});
			return null;
		}
		var _id = this.string_slot_id(_slot);
		return storage.getItem(_id);
	}
	,string_slot_encode: function(_string) {
		return window.btoa(_string);
	}
	,string_slot_decode: function(_string) {
		return window.atob(_string);
	}
	,__class__: snow_core_web_io_IO
};
var snow_modules_opengl_web_GL = function() { };
$hxClasses["snow.modules.opengl.web.GL"] = snow_modules_opengl_web_GL;
snow_modules_opengl_web_GL.__name__ = ["snow","modules","opengl","web","GL"];
snow_modules_opengl_web_GL.__properties__ = {get_version:"get_version"}
snow_modules_opengl_web_GL.versionString = function() {
	var ver = snow_modules_opengl_web_GL.gl.getParameter(7938);
	var slver = snow_modules_opengl_web_GL.gl.getParameter(35724);
	var ren = snow_modules_opengl_web_GL.gl.getParameter(7937);
	var ven = snow_modules_opengl_web_GL.gl.getParameter(7936);
	return "/ " + ver + " / " + slver + " / " + ren + " / " + ven + " /";
};
snow_modules_opengl_web_GL.activeTexture = function(texture) {
	snow_modules_opengl_web_GL.gl.activeTexture(texture);
};
snow_modules_opengl_web_GL.attachShader = function(program,shader) {
	snow_modules_opengl_web_GL.gl.attachShader(program,shader);
};
snow_modules_opengl_web_GL.bindAttribLocation = function(program,index,name) {
	snow_modules_opengl_web_GL.gl.bindAttribLocation(program,index,name);
};
snow_modules_opengl_web_GL.bindBuffer = function(target,buffer) {
	snow_modules_opengl_web_GL.gl.bindBuffer(target,buffer);
};
snow_modules_opengl_web_GL.bindFramebuffer = function(target,framebuffer) {
	snow_modules_opengl_web_GL.gl.bindFramebuffer(target,framebuffer);
};
snow_modules_opengl_web_GL.bindRenderbuffer = function(target,renderbuffer) {
	snow_modules_opengl_web_GL.gl.bindRenderbuffer(target,renderbuffer);
};
snow_modules_opengl_web_GL.bindTexture = function(target,texture) {
	snow_modules_opengl_web_GL.gl.bindTexture(target,texture);
};
snow_modules_opengl_web_GL.blendColor = function(red,green,blue,alpha) {
	snow_modules_opengl_web_GL.gl.blendColor(red,green,blue,alpha);
};
snow_modules_opengl_web_GL.blendEquation = function(mode) {
	snow_modules_opengl_web_GL.gl.blendEquation(mode);
};
snow_modules_opengl_web_GL.blendEquationSeparate = function(modeRGB,modeAlpha) {
	snow_modules_opengl_web_GL.gl.blendEquationSeparate(modeRGB,modeAlpha);
};
snow_modules_opengl_web_GL.blendFunc = function(sfactor,dfactor) {
	snow_modules_opengl_web_GL.gl.blendFunc(sfactor,dfactor);
};
snow_modules_opengl_web_GL.blendFuncSeparate = function(srcRGB,dstRGB,srcAlpha,dstAlpha) {
	snow_modules_opengl_web_GL.gl.blendFuncSeparate(srcRGB,dstRGB,srcAlpha,dstAlpha);
};
snow_modules_opengl_web_GL.bufferData = function(target,data,usage) {
	snow_modules_opengl_web_GL.gl.bufferData(target,data,usage);
};
snow_modules_opengl_web_GL.bufferSubData = function(target,offset,data) {
	snow_modules_opengl_web_GL.gl.bufferSubData(target,offset,data);
};
snow_modules_opengl_web_GL.checkFramebufferStatus = function(target) {
	return snow_modules_opengl_web_GL.gl.checkFramebufferStatus(target);
};
snow_modules_opengl_web_GL.clear = function(mask) {
	snow_modules_opengl_web_GL.gl.clear(mask);
};
snow_modules_opengl_web_GL.clearColor = function(red,green,blue,alpha) {
	snow_modules_opengl_web_GL.gl.clearColor(red,green,blue,alpha);
};
snow_modules_opengl_web_GL.clearDepth = function(depth) {
	snow_modules_opengl_web_GL.gl.clearDepth(depth);
};
snow_modules_opengl_web_GL.clearStencil = function(s) {
	snow_modules_opengl_web_GL.gl.clearStencil(s);
};
snow_modules_opengl_web_GL.colorMask = function(red,green,blue,alpha) {
	snow_modules_opengl_web_GL.gl.colorMask(red,green,blue,alpha);
};
snow_modules_opengl_web_GL.compileShader = function(shader) {
	snow_modules_opengl_web_GL.gl.compileShader(shader);
};
snow_modules_opengl_web_GL.compressedTexImage2D = function(target,level,internalformat,width,height,border,data) {
	snow_modules_opengl_web_GL.gl.compressedTexImage2D(target,level,internalformat,width,height,border,data);
};
snow_modules_opengl_web_GL.compressedTexSubImage2D = function(target,level,xoffset,yoffset,width,height,format,data) {
	snow_modules_opengl_web_GL.gl.compressedTexSubImage2D(target,level,xoffset,yoffset,width,height,format,data);
};
snow_modules_opengl_web_GL.copyTexImage2D = function(target,level,internalformat,x,y,width,height,border) {
	snow_modules_opengl_web_GL.gl.copyTexImage2D(target,level,internalformat,x,y,width,height,border);
};
snow_modules_opengl_web_GL.copyTexSubImage2D = function(target,level,xoffset,yoffset,x,y,width,height) {
	snow_modules_opengl_web_GL.gl.copyTexSubImage2D(target,level,xoffset,yoffset,x,y,width,height);
};
snow_modules_opengl_web_GL.createBuffer = function() {
	return snow_modules_opengl_web_GL.gl.createBuffer();
};
snow_modules_opengl_web_GL.createFramebuffer = function() {
	return snow_modules_opengl_web_GL.gl.createFramebuffer();
};
snow_modules_opengl_web_GL.createProgram = function() {
	return snow_modules_opengl_web_GL.gl.createProgram();
};
snow_modules_opengl_web_GL.createRenderbuffer = function() {
	return snow_modules_opengl_web_GL.gl.createRenderbuffer();
};
snow_modules_opengl_web_GL.createShader = function(type) {
	return snow_modules_opengl_web_GL.gl.createShader(type);
};
snow_modules_opengl_web_GL.createTexture = function() {
	return snow_modules_opengl_web_GL.gl.createTexture();
};
snow_modules_opengl_web_GL.cullFace = function(mode) {
	snow_modules_opengl_web_GL.gl.cullFace(mode);
};
snow_modules_opengl_web_GL.deleteBuffer = function(buffer) {
	snow_modules_opengl_web_GL.gl.deleteBuffer(buffer);
};
snow_modules_opengl_web_GL.deleteFramebuffer = function(framebuffer) {
	snow_modules_opengl_web_GL.gl.deleteFramebuffer(framebuffer);
};
snow_modules_opengl_web_GL.deleteProgram = function(program) {
	snow_modules_opengl_web_GL.gl.deleteProgram(program);
};
snow_modules_opengl_web_GL.deleteRenderbuffer = function(renderbuffer) {
	snow_modules_opengl_web_GL.gl.deleteRenderbuffer(renderbuffer);
};
snow_modules_opengl_web_GL.deleteShader = function(shader) {
	snow_modules_opengl_web_GL.gl.deleteShader(shader);
};
snow_modules_opengl_web_GL.deleteTexture = function(texture) {
	snow_modules_opengl_web_GL.gl.deleteTexture(texture);
};
snow_modules_opengl_web_GL.depthFunc = function(func) {
	snow_modules_opengl_web_GL.gl.depthFunc(func);
};
snow_modules_opengl_web_GL.depthMask = function(flag) {
	snow_modules_opengl_web_GL.gl.depthMask(flag);
};
snow_modules_opengl_web_GL.depthRange = function(zNear,zFar) {
	snow_modules_opengl_web_GL.gl.depthRange(zNear,zFar);
};
snow_modules_opengl_web_GL.detachShader = function(program,shader) {
	snow_modules_opengl_web_GL.gl.detachShader(program,shader);
};
snow_modules_opengl_web_GL.disable = function(cap) {
	snow_modules_opengl_web_GL.gl.disable(cap);
};
snow_modules_opengl_web_GL.disableVertexAttribArray = function(index) {
	snow_modules_opengl_web_GL.gl.disableVertexAttribArray(index);
};
snow_modules_opengl_web_GL.drawArrays = function(mode,first,count) {
	snow_modules_opengl_web_GL.gl.drawArrays(mode,first,count);
};
snow_modules_opengl_web_GL.drawElements = function(mode,count,type,offset) {
	snow_modules_opengl_web_GL.gl.drawElements(mode,count,type,offset);
};
snow_modules_opengl_web_GL.enable = function(cap) {
	snow_modules_opengl_web_GL.gl.enable(cap);
};
snow_modules_opengl_web_GL.enableVertexAttribArray = function(index) {
	snow_modules_opengl_web_GL.gl.enableVertexAttribArray(index);
};
snow_modules_opengl_web_GL.finish = function() {
	snow_modules_opengl_web_GL.gl.finish();
};
snow_modules_opengl_web_GL.flush = function() {
	snow_modules_opengl_web_GL.gl.flush();
};
snow_modules_opengl_web_GL.framebufferRenderbuffer = function(target,attachment,renderbuffertarget,renderbuffer) {
	snow_modules_opengl_web_GL.gl.framebufferRenderbuffer(target,attachment,renderbuffertarget,renderbuffer);
};
snow_modules_opengl_web_GL.framebufferTexture2D = function(target,attachment,textarget,texture,level) {
	snow_modules_opengl_web_GL.gl.framebufferTexture2D(target,attachment,textarget,texture,level);
};
snow_modules_opengl_web_GL.frontFace = function(mode) {
	snow_modules_opengl_web_GL.gl.frontFace(mode);
};
snow_modules_opengl_web_GL.generateMipmap = function(target) {
	snow_modules_opengl_web_GL.gl.generateMipmap(target);
};
snow_modules_opengl_web_GL.getActiveAttrib = function(program,index) {
	return snow_modules_opengl_web_GL.gl.getActiveAttrib(program,index);
};
snow_modules_opengl_web_GL.getActiveUniform = function(program,index) {
	return snow_modules_opengl_web_GL.gl.getActiveUniform(program,index);
};
snow_modules_opengl_web_GL.getAttachedShaders = function(program) {
	return snow_modules_opengl_web_GL.gl.getAttachedShaders(program);
};
snow_modules_opengl_web_GL.getAttribLocation = function(program,name) {
	return snow_modules_opengl_web_GL.gl.getAttribLocation(program,name);
};
snow_modules_opengl_web_GL.getBufferParameter = function(target,pname) {
	return snow_modules_opengl_web_GL.gl.getBufferParameter(target,pname);
};
snow_modules_opengl_web_GL.getContextAttributes = function() {
	return snow_modules_opengl_web_GL.gl.getContextAttributes();
};
snow_modules_opengl_web_GL.getError = function() {
	return snow_modules_opengl_web_GL.gl.getError();
};
snow_modules_opengl_web_GL.getExtension = function(name) {
	return snow_modules_opengl_web_GL.gl.getExtension(name);
};
snow_modules_opengl_web_GL.getFramebufferAttachmentParameter = function(target,attachment,pname) {
	return snow_modules_opengl_web_GL.gl.getFramebufferAttachmentParameter(target,attachment,pname);
};
snow_modules_opengl_web_GL.getParameter = function(pname) {
	return snow_modules_opengl_web_GL.gl.getParameter(pname);
};
snow_modules_opengl_web_GL.getProgramInfoLog = function(program) {
	return snow_modules_opengl_web_GL.gl.getProgramInfoLog(program);
};
snow_modules_opengl_web_GL.getProgramParameter = function(program,pname) {
	return snow_modules_opengl_web_GL.gl.getProgramParameter(program,pname);
};
snow_modules_opengl_web_GL.getRenderbufferParameter = function(target,pname) {
	return snow_modules_opengl_web_GL.gl.getRenderbufferParameter(target,pname);
};
snow_modules_opengl_web_GL.getShaderInfoLog = function(shader) {
	return snow_modules_opengl_web_GL.gl.getShaderInfoLog(shader);
};
snow_modules_opengl_web_GL.getShaderParameter = function(shader,pname) {
	return snow_modules_opengl_web_GL.gl.getShaderParameter(shader,pname);
};
snow_modules_opengl_web_GL.getShaderPrecisionFormat = function(shadertype,precisiontype) {
	return snow_modules_opengl_web_GL.gl.getShaderPrecisionFormat(shadertype,precisiontype);
};
snow_modules_opengl_web_GL.getShaderSource = function(shader) {
	return snow_modules_opengl_web_GL.gl.getShaderSource(shader);
};
snow_modules_opengl_web_GL.getSupportedExtensions = function() {
	return snow_modules_opengl_web_GL.gl.getSupportedExtensions();
};
snow_modules_opengl_web_GL.getTexParameter = function(target,pname) {
	return snow_modules_opengl_web_GL.gl.getTexParameter(target,pname);
};
snow_modules_opengl_web_GL.getUniform = function(program,location) {
	return snow_modules_opengl_web_GL.gl.getUniform(program,location);
};
snow_modules_opengl_web_GL.getUniformLocation = function(program,name) {
	return snow_modules_opengl_web_GL.gl.getUniformLocation(program,name);
};
snow_modules_opengl_web_GL.getVertexAttrib = function(index,pname) {
	return snow_modules_opengl_web_GL.gl.getVertexAttrib(index,pname);
};
snow_modules_opengl_web_GL.getVertexAttribOffset = function(index,pname) {
	return snow_modules_opengl_web_GL.gl.getVertexAttribOffset(index,pname);
};
snow_modules_opengl_web_GL.hint = function(target,mode) {
	snow_modules_opengl_web_GL.gl.hint(target,mode);
};
snow_modules_opengl_web_GL.isBuffer = function(buffer) {
	return snow_modules_opengl_web_GL.gl.isBuffer(buffer);
};
snow_modules_opengl_web_GL.isEnabled = function(cap) {
	return snow_modules_opengl_web_GL.gl.isEnabled(cap);
};
snow_modules_opengl_web_GL.isFramebuffer = function(framebuffer) {
	return snow_modules_opengl_web_GL.gl.isFramebuffer(framebuffer);
};
snow_modules_opengl_web_GL.isProgram = function(program) {
	return snow_modules_opengl_web_GL.gl.isProgram(program);
};
snow_modules_opengl_web_GL.isRenderbuffer = function(renderbuffer) {
	return snow_modules_opengl_web_GL.gl.isRenderbuffer(renderbuffer);
};
snow_modules_opengl_web_GL.isShader = function(shader) {
	return snow_modules_opengl_web_GL.gl.isShader(shader);
};
snow_modules_opengl_web_GL.isTexture = function(texture) {
	return snow_modules_opengl_web_GL.gl.isTexture(texture);
};
snow_modules_opengl_web_GL.lineWidth = function(width) {
	snow_modules_opengl_web_GL.gl.lineWidth(width);
};
snow_modules_opengl_web_GL.linkProgram = function(program) {
	snow_modules_opengl_web_GL.gl.linkProgram(program);
};
snow_modules_opengl_web_GL.pixelStorei = function(pname,param) {
	snow_modules_opengl_web_GL.gl.pixelStorei(pname,param);
};
snow_modules_opengl_web_GL.polygonOffset = function(factor,units) {
	snow_modules_opengl_web_GL.gl.polygonOffset(factor,units);
};
snow_modules_opengl_web_GL.readPixels = function(x,y,width,height,format,type,data) {
	snow_modules_opengl_web_GL.gl.readPixels(x,y,width,height,format,type,data);
};
snow_modules_opengl_web_GL.renderbufferStorage = function(target,internalformat,width,height) {
	snow_modules_opengl_web_GL.gl.renderbufferStorage(target,internalformat,width,height);
};
snow_modules_opengl_web_GL.sampleCoverage = function(value,invert) {
	snow_modules_opengl_web_GL.gl.sampleCoverage(value,invert);
};
snow_modules_opengl_web_GL.scissor = function(x,y,width,height) {
	snow_modules_opengl_web_GL.gl.scissor(x,y,width,height);
};
snow_modules_opengl_web_GL.shaderSource = function(shader,source) {
	snow_modules_opengl_web_GL.gl.shaderSource(shader,source);
};
snow_modules_opengl_web_GL.stencilFunc = function(func,ref,mask) {
	snow_modules_opengl_web_GL.gl.stencilFunc(func,ref,mask);
};
snow_modules_opengl_web_GL.stencilFuncSeparate = function(face,func,ref,mask) {
	snow_modules_opengl_web_GL.gl.stencilFuncSeparate(face,func,ref,mask);
};
snow_modules_opengl_web_GL.stencilMask = function(mask) {
	snow_modules_opengl_web_GL.gl.stencilMask(mask);
};
snow_modules_opengl_web_GL.stencilMaskSeparate = function(face,mask) {
	snow_modules_opengl_web_GL.gl.stencilMaskSeparate(face,mask);
};
snow_modules_opengl_web_GL.stencilOp = function(fail,zfail,zpass) {
	snow_modules_opengl_web_GL.gl.stencilOp(fail,zfail,zpass);
};
snow_modules_opengl_web_GL.stencilOpSeparate = function(face,fail,zfail,zpass) {
	snow_modules_opengl_web_GL.gl.stencilOpSeparate(face,fail,zfail,zpass);
};
snow_modules_opengl_web_GL.texImage2D = function(target,level,internalformat,width,height,border,format,type,data) {
	snow_modules_opengl_web_GL.gl.texImage2D(target,level,internalformat,width,height,border,format,type,data);
};
snow_modules_opengl_web_GL.texParameterf = function(target,pname,param) {
	snow_modules_opengl_web_GL.gl.texParameterf(target,pname,param);
};
snow_modules_opengl_web_GL.texParameteri = function(target,pname,param) {
	snow_modules_opengl_web_GL.gl.texParameteri(target,pname,param);
};
snow_modules_opengl_web_GL.texSubImage2D = function(target,level,xoffset,yoffset,width,height,format,type,data) {
	snow_modules_opengl_web_GL.gl.texSubImage2D(target,level,xoffset,yoffset,width,height,format,type,data);
};
snow_modules_opengl_web_GL.uniform1f = function(location,x) {
	snow_modules_opengl_web_GL.gl.uniform1f(location,x);
};
snow_modules_opengl_web_GL.uniform1fv = function(location,data) {
	snow_modules_opengl_web_GL.gl.uniform1fv(location,data);
};
snow_modules_opengl_web_GL.uniform1i = function(location,x) {
	snow_modules_opengl_web_GL.gl.uniform1i(location,x);
};
snow_modules_opengl_web_GL.uniform1iv = function(location,data) {
	snow_modules_opengl_web_GL.gl.uniform1iv(location,data);
};
snow_modules_opengl_web_GL.uniform2f = function(location,x,y) {
	snow_modules_opengl_web_GL.gl.uniform2f(location,x,y);
};
snow_modules_opengl_web_GL.uniform2fv = function(location,data) {
	snow_modules_opengl_web_GL.gl.uniform2fv(location,data);
};
snow_modules_opengl_web_GL.uniform2i = function(location,x,y) {
	snow_modules_opengl_web_GL.gl.uniform2i(location,x,y);
};
snow_modules_opengl_web_GL.uniform2iv = function(location,data) {
	snow_modules_opengl_web_GL.gl.uniform2iv(location,data);
};
snow_modules_opengl_web_GL.uniform3f = function(location,x,y,z) {
	snow_modules_opengl_web_GL.gl.uniform3f(location,x,y,z);
};
snow_modules_opengl_web_GL.uniform3fv = function(location,data) {
	snow_modules_opengl_web_GL.gl.uniform3fv(location,data);
};
snow_modules_opengl_web_GL.uniform3i = function(location,x,y,z) {
	snow_modules_opengl_web_GL.gl.uniform3i(location,x,y,z);
};
snow_modules_opengl_web_GL.uniform3iv = function(location,data) {
	snow_modules_opengl_web_GL.gl.uniform3iv(location,data);
};
snow_modules_opengl_web_GL.uniform4f = function(location,x,y,z,w) {
	snow_modules_opengl_web_GL.gl.uniform4f(location,x,y,z,w);
};
snow_modules_opengl_web_GL.uniform4fv = function(location,data) {
	snow_modules_opengl_web_GL.gl.uniform4fv(location,data);
};
snow_modules_opengl_web_GL.uniform4i = function(location,x,y,z,w) {
	snow_modules_opengl_web_GL.gl.uniform4i(location,x,y,z,w);
};
snow_modules_opengl_web_GL.uniform4iv = function(location,data) {
	snow_modules_opengl_web_GL.gl.uniform4iv(location,data);
};
snow_modules_opengl_web_GL.uniformMatrix2fv = function(location,transpose,data) {
	snow_modules_opengl_web_GL.gl.uniformMatrix2fv(location,transpose,data);
};
snow_modules_opengl_web_GL.uniformMatrix3fv = function(location,transpose,data) {
	snow_modules_opengl_web_GL.gl.uniformMatrix3fv(location,transpose,data);
};
snow_modules_opengl_web_GL.uniformMatrix4fv = function(location,transpose,data) {
	snow_modules_opengl_web_GL.gl.uniformMatrix4fv(location,transpose,data);
};
snow_modules_opengl_web_GL.useProgram = function(program) {
	snow_modules_opengl_web_GL.gl.useProgram(program);
};
snow_modules_opengl_web_GL.validateProgram = function(program) {
	snow_modules_opengl_web_GL.gl.validateProgram(program);
};
snow_modules_opengl_web_GL.vertexAttrib1f = function(indx,x) {
	snow_modules_opengl_web_GL.gl.vertexAttrib1f(indx,x);
};
snow_modules_opengl_web_GL.vertexAttrib1fv = function(indx,data) {
	snow_modules_opengl_web_GL.gl.vertexAttrib1fv(indx,data);
};
snow_modules_opengl_web_GL.vertexAttrib2f = function(indx,x,y) {
	snow_modules_opengl_web_GL.gl.vertexAttrib2f(indx,x,y);
};
snow_modules_opengl_web_GL.vertexAttrib2fv = function(indx,data) {
	snow_modules_opengl_web_GL.gl.vertexAttrib2fv(indx,data);
};
snow_modules_opengl_web_GL.vertexAttrib3f = function(indx,x,y,z) {
	snow_modules_opengl_web_GL.gl.vertexAttrib3f(indx,x,y,z);
};
snow_modules_opengl_web_GL.vertexAttrib3fv = function(indx,data) {
	snow_modules_opengl_web_GL.gl.vertexAttrib3fv(indx,data);
};
snow_modules_opengl_web_GL.vertexAttrib4f = function(indx,x,y,z,w) {
	snow_modules_opengl_web_GL.gl.vertexAttrib4f(indx,x,y,z,w);
};
snow_modules_opengl_web_GL.vertexAttrib4fv = function(indx,data) {
	snow_modules_opengl_web_GL.gl.vertexAttrib4fv(indx,data);
};
snow_modules_opengl_web_GL.vertexAttribPointer = function(indx,size,type,normalized,stride,offset) {
	snow_modules_opengl_web_GL.gl.vertexAttribPointer(indx,size,type,normalized,stride,offset);
};
snow_modules_opengl_web_GL.viewport = function(x,y,width,height) {
	snow_modules_opengl_web_GL.gl.viewport(x,y,width,height);
};
snow_modules_opengl_web_GL.get_version = function() {
	return 7938;
};
var snow_modules_webaudio_Audio = function(_app) {
	this.active = false;
	this.handle_seq = 0;
	this.app = _app;
	this.instances = new haxe_ds_IntMap();
	try {
		this.context = new AudioContext();
	} catch( err ) {
		if (err instanceof js__$Boot_HaxeError) err = err.val;
		this.context = new window.webkitAudioContext();
	}
	if(this.context == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("context was null" + (" ( " + "Audio / webaudio / no AudioContext could be created, is the Web Audio API supported?" + " )")));
	var info = "channelCount: " + this.context.destination.channelCount + ", " + ("channelCountMode: \"" + this.context.destination.channelCountMode + "\", ") + ("channelInterpretation: \"" + this.context.destination.channelInterpretation + "\", ") + ("maxChannelCount: " + this.context.destination.maxChannelCount + ", ") + ("numberOfInputs: " + this.context.destination.numberOfInputs + ", ") + ("numberOfOutputs: " + this.context.destination.numberOfOutputs);
	haxe_Log.trace("    i / audio / " + ("webaudio: " + Std.string(this.context) + " / sampleRate: " + this.context.sampleRate + " / destination: " + info),{ fileName : "Audio.hx", lineNumber : 68, className : "snow.modules.webaudio.Audio", methodName : "new"});
	this.active = true;
};
$hxClasses["snow.modules.webaudio.Audio"] = snow_modules_webaudio_Audio;
snow_modules_webaudio_Audio.__name__ = ["snow","modules","webaudio","Audio"];
snow_modules_webaudio_Audio.__interfaces__ = [snow_modules_interfaces_Audio];
snow_modules_webaudio_Audio.prototype = {
	shutdown: function() {
		this.context.close();
	}
	,onevent: function(event) {
	}
	,snd_of: function(_handle) {
		return this.instances.h[_handle];
	}
	,play_buffer: function(_data) {
		var _node = this.context.createBufferSource();
		_node.buffer = _data.buffer;
		return _node;
	}
	,play_buffer_again: function(_handle,_snd,_start_time) {
		_snd.buffer_node = this.play_buffer(_snd.source.data);
		_snd.buffer_node.connect(_snd.pan_node);
		_snd.buffer_node.loop = _snd.loop;
		_snd.pan_node.connect(_snd.gain_node);
		_snd.gain_node.connect(this.context.destination);
		_snd.buffer_node.start(0,_start_time);
		_snd.buffer_node.onended = (function(f,a1) {
			return function() {
				f(a1);
			};
		})($bind(this,this.destroy_snd),_snd);
	}
	,play_instance: function(_handle,_source,_inst,_data,_buffer_node,_volume,_loop) {
		var _g = this;
		var _gain = this.context.createGain();
		var _pan = this.context.createPanner();
		var _node = null;
		var _pan_val = 0;
		_gain.gain.value = _volume;
		_pan.panningModel = "equalpower";
		_pan.setPosition(Math.cos(-1.5707),0,Math.sin(1.5707));
		if(_buffer_node != null) {
			_node = _buffer_node;
			_buffer_node.loop = _loop;
		}
		if(_data.media_node != null) {
			_node = _data.media_node;
			_data.media_elem.loop = _loop;
		}
		_node.connect(_pan);
		_pan.connect(_gain);
		_gain.connect(this.context.destination);
		var _snd = { handle : _handle, source : _source, instance : _inst, buffer_node : _buffer_node, media_node : _data.media_node, media_elem : _data.media_elem, gain_node : _gain, pan_node : _pan, state : 1, time_start : window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start, loop : _loop, pan : 0};
		this.instances.h[_handle] = _snd;
		if(_buffer_node != null) {
			_buffer_node.start(0);
			_buffer_node.onended = (function(f,a1) {
				return function() {
					f(a1);
				};
			})($bind(this,this.destroy_snd),_snd);
		}
		if(_data.media_node != null) {
			_data.media_elem.play();
			_data.media_node.addEventListener("ended",function() {
				_g.app.audio.emit_Int(0,_handle);
				_snd.state = 2;
			});
		}
	}
	,play: function(_source,_volume,_paused) {
		var _data = _source.data;
		var _handle = this.handle_seq;
		var _inst = _source.instance(_handle);
		if(_source.data.is_stream) {
			_data.media_elem.play();
			_data.media_elem.volume = 1.0;
			this.play_instance(_handle,_source,_inst,_data,null,_volume,false);
		} else this.play_instance(_handle,_source,_inst,_data,this.play_buffer(_data),_volume,false);
		this.handle_seq++;
		return _handle;
	}
	,loop: function(_source,_volume,_paused) {
		var _data = _source.data;
		var _handle = this.handle_seq;
		var _inst = _source.instance(_handle);
		if(_source.data.is_stream) {
			_data.media_elem.play();
			_data.media_elem.volume = 1.0;
			this.play_instance(_handle,_source,_inst,_data,null,_volume,true);
		} else this.play_instance(_handle,_source,_inst,_data,this.play_buffer(_data),_volume,true);
		this.handle_seq++;
		return _handle;
	}
	,stop_buffer: function(_snd) {
		_snd.buffer_node.stop();
		_snd.buffer_node.disconnect();
		_snd.gain_node.disconnect();
		_snd.pan_node.disconnect();
		_snd.buffer_node = null;
	}
	,pause: function(_handle) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return;
		_snd.time_pause = window.performance.now() / 1000.0 - snow_core_web_Runtime.timestamp_start - _snd.time_start;
		_snd.state = 0;
		if(_snd.buffer_node != null) this.stop_buffer(_snd); else if(_snd.media_node != null) _snd.media_elem.pause();
	}
	,unpause: function(_handle) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return;
		if(_snd.state != 0) return;
		if(_snd.media_node == null) this.play_buffer_again(_handle,_snd,_snd.time_pause); else _snd.media_elem.play();
		_snd.state = 1;
	}
	,destroy_snd: function(_snd) {
		if(_snd.buffer_node != null) {
			_snd.buffer_node.stop();
			_snd.buffer_node.disconnect();
			_snd.buffer_node = null;
		}
		if(_snd.media_node != null) {
			_snd.media_elem.pause();
			_snd.media_elem.currentTime = 0;
			_snd.media_node.disconnect();
			_snd.media_elem = null;
			_snd.media_node = null;
		}
		if(_snd.gain_node != null) {
			_snd.gain_node.disconnect();
			_snd.gain_node = null;
		}
		if(_snd.pan_node != null) {
			_snd.pan_node.disconnect();
			_snd.pan_node = null;
		}
		this.instances.remove(_snd.handle);
		_snd = null;
	}
	,stop: function(_handle) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return;
		this.destroy_snd(_snd);
		_snd.state = 2;
	}
	,volume: function(_handle,_volume) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return;
		_snd.gain_node.gain.value = _volume;
	}
	,pan: function(_handle,_pan) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return;
		_snd.pan = _pan;
		_snd.pan_node.setPosition(Math.cos((_pan - 1) * 1.5707),0,Math.sin((_pan + 1) * 1.5707));
	}
	,pitch: function(_handle,_pitch) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return;
		if(_snd.buffer_node != null) _snd.buffer_node.playbackRate.value = _pitch; else if(_snd.media_node != null) _snd.media_elem.playbackRate = _pitch;
	}
	,position: function(_handle,_time) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return;
		if(_snd.buffer_node != null) {
			this.stop_buffer(_snd);
			this.play_buffer_again(_handle,_snd,_time);
		} else _snd.media_elem.currentTime = _time;
	}
	,volume_of: function(_handle) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return 0.0;
		return _snd.gain_node.gain.value;
	}
	,pan_of: function(_handle) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return 0.0;
		return _snd.pan;
	}
	,pitch_of: function(_handle) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return 0.0;
		var _result = 1.0;
		if(_snd.buffer_node != null) _result = _snd.buffer_node.playbackRate.value; else if(_snd.media_node != null) _result = _snd.media_elem.playbackRate;
		return _result;
	}
	,position_of: function(_handle) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return 0.0;
		return 0.0;
	}
	,state_of: function(_handle) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return -1;
		return _snd.state;
	}
	,loop_of: function(_handle) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return false;
		return _snd.loop;
	}
	,instance_of: function(_handle) {
		var _snd = this.instances.h[_handle];
		if(_snd == null) return null;
		return _snd.instance;
	}
	,suspend: function() {
		this.context.suspend();
	}
	,resume: function() {
		this.context.resume();
	}
	,data_from_load: function(_path,_is_stream,_format) {
		if(_is_stream == null) _is_stream = false;
		if(_format == null) _format = snow_core_Audio.audio_format_from_path(_path);
		if(_is_stream) return this.data_from_load_stream(_path,_format);
		return this.data_from_load_sound(_path,_format);
	}
	,data_from_bytes: function(_id,_bytes,_format) {
		var _g = this;
		return new snow_api_Promise(function(resolve,reject) {
			_g.data_from_bytes_direct(_id,_bytes,_format,resolve,reject);
		});
	}
	,data_from_bytes_direct: function(_id,_bytes,_format,resolve,reject) {
		var _g = this;
		this.context.decodeAudioData(_bytes.buffer,function(_buffer) {
			var _data = new snow_modules_webaudio__$Audio_AudioDataWebAudio(_g.app,_buffer,null,null,{ id : _id, is_stream : false, format : _format, samples : null, length : _buffer.length, channels : _buffer.numberOfChannels, rate : _buffer.sampleRate | 0});
			resolve(_data);
			return;
		},function() {
			reject("failed to decode audio for `" + _id + "`");
			return;
		});
	}
	,data_from_load_sound: function(_path,_format) {
		var _g = this;
		return new snow_api_Promise(function(resolve,reject) {
			var _load = _g.app.io.module.data_load(_path,null);
			_load.then(function(_bytes) {
				_g.data_from_bytes_direct(_path,_bytes,_format,resolve,reject);
			});
		});
	}
	,data_from_load_stream: function(_path,_format) {
		var _g = this;
		return new snow_api_Promise(function(resolve,reject) {
			var _element = new Audio(_path);
			_element.autoplay = false;
			_element.controls = false;
			_element.preload = "auto";
			_element.onerror = function(err) {
				var _error;
				var _g1 = _element.error.code;
				switch(_g1) {
				case 1:
					_error = "MEDIA_ERR_ABORTED";
					break;
				case 2:
					_error = "MEDIA_ERR_NETWORK";
					break;
				case 3:
					_error = "MEDIA_ERR_DECODE";
					break;
				case 4:
					_error = "MEDIA_ERR_SRC_NOT_SUPPORTED";
					break;
				case 5:
					_error = "MEDIA_ERR_ENCRYPTED";
					break;
				default:
					_error = "unknown error";
				}
				return reject("failed to load `" + _path + "` as stream : `" + _error + "`");
			};
			_element.onloadedmetadata = function(_) {
				var _node = _g.context.createMediaElementSource(_element);
				var _bytes_per_sample = 2;
				var _rate = _g.context.sampleRate | 0;
				var _channels = _node.channelCount;
				var _sample_frames = _rate * _channels * _bytes_per_sample;
				var _length = _element.duration * _sample_frames | 0;
				var _data = new snow_modules_webaudio__$Audio_AudioDataWebAudio(_g.app,null,_node,_element,{ id : _path, is_stream : true, format : _format, samples : null, length : _length, channels : _channels, rate : _rate});
				return resolve(_data);
			};
		});
	}
	,__class__: snow_modules_webaudio_Audio
};
var snow_types_AudioData = function(_app,_options) {
	this.is_stream = false;
	this.format = 0;
	this.channels = 1;
	this.length = 0;
	this.rate = 44100;
	this.id = "AudioData";
	this.app = _app;
	if(_options.id == null) _options.id = this.id;
	this.id = _options.id;
	if(_options.rate == null) _options.rate = this.rate;
	this.rate = _options.rate;
	if(_options.length == null) _options.length = this.length;
	this.length = _options.length;
	if(_options.format == null) _options.format = this.format;
	this.format = _options.format;
	if(_options.channels == null) _options.channels = this.channels;
	this.channels = _options.channels;
	if(_options.is_stream == null) _options.is_stream = this.is_stream;
	this.is_stream = _options.is_stream;
	if(_options.samples == null) _options.samples = this.samples;
	this.samples = _options.samples;
	_options = null;
};
$hxClasses["snow.types.AudioData"] = snow_types_AudioData;
snow_types_AudioData.__name__ = ["snow","types","AudioData"];
snow_types_AudioData.prototype = {
	destroy: function() {
		this.id = null;
		this.samples = null;
	}
	,seek: function(_to) {
		return false;
	}
	,portion: function(_into,_start,_len,_into_result) {
		return _into_result;
	}
	,toString: function() {
		return "{ \"AudioData\":true, \"id\":" + this.id + ", \"rate\":" + this.rate + ", \"length\":" + this.length + ", \"channels\":" + this.channels + ", \"format\":\"" + (function($this) {
			var $r;
			var this1 = $this.format;
			$r = this1 != null?(function($this) {
				var $r;
				switch(this1) {
				case 0:
					$r = "af_unknown";
					break;
				case 1:
					$r = "af_custom";
					break;
				case 2:
					$r = "af_ogg";
					break;
				case 3:
					$r = "af_wav";
					break;
				case 4:
					$r = "af_pcm";
					break;
				default:
					$r = "" + this1;
				}
				return $r;
			}($this)):"" + this1;
			return $r;
		}(this)) + "\", \"is_stream\":" + Std.string(this.is_stream) + " }";
	}
	,__class__: snow_types_AudioData
};
var snow_modules_webaudio__$Audio_AudioDataWebAudio = function(_app,_buffer,_media_node,_media_elem,_opt) {
	this.buffer = _buffer;
	this.media_node = _media_node;
	this.media_elem = _media_elem;
	snow_types_AudioData.call(this,_app,_opt);
};
$hxClasses["snow.modules.webaudio._Audio.AudioDataWebAudio"] = snow_modules_webaudio__$Audio_AudioDataWebAudio;
snow_modules_webaudio__$Audio_AudioDataWebAudio.__name__ = ["snow","modules","webaudio","_Audio","AudioDataWebAudio"];
snow_modules_webaudio__$Audio_AudioDataWebAudio.__super__ = snow_types_AudioData;
snow_modules_webaudio__$Audio_AudioDataWebAudio.prototype = $extend(snow_types_AudioData.prototype,{
	destroy: function() {
		this.buffer = null;
		this.media_node = null;
		this.media_elem = null;
	}
	,__class__: snow_modules_webaudio__$Audio_AudioDataWebAudio
});
var snow_systems_assets_Asset = function(_system,_id,_type) {
	if(_type == null) _type = 0;
	this.loaded = false;
	if(_id == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_id was null" + ""));
	if(_system == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_system was null" + ""));
	this.system = _system;
	this.type = _type;
	this.id = _id;
};
$hxClasses["snow.systems.assets.Asset"] = snow_systems_assets_Asset;
snow_systems_assets_Asset.__name__ = ["snow","systems","assets","Asset"];
snow_systems_assets_Asset.prototype = {
	destroy: function() {
	}
	,__class__: snow_systems_assets_Asset
};
var snow_systems_assets_AssetImage = function(_system,_id,_image) {
	snow_systems_assets_Asset.call(this,_system,_id,4);
	this.set_image(_image);
};
$hxClasses["snow.systems.assets.AssetImage"] = snow_systems_assets_AssetImage;
snow_systems_assets_AssetImage.__name__ = ["snow","systems","assets","AssetImage"];
snow_systems_assets_AssetImage.load = function(_system,_id) {
	if(_id == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_id was null" + ""));
	if(_system == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_system was null" + ""));
	return new snow_systems_assets_AssetImage(_system,_id,null).reload();
};
snow_systems_assets_AssetImage.load_from_bytes = function(_system,_id,_bytes) {
	if(_id == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_id was null" + ""));
	if(_bytes == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_bytes was null" + ""));
	if(_system == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_system was null" + ""));
	return new snow_systems_assets_AssetImage(_system,_id,null).reload_from_bytes(_bytes);
};
snow_systems_assets_AssetImage.load_from_pixels = function(_system,_id,_width,_height,_pixels) {
	if(_id == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_id was null" + ""));
	if(_pixels == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_pixels was null" + ""));
	if(_system == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_system was null" + ""));
	var info = _system.module.image_info_from_pixels(_id,_width,_height,_pixels);
	return new snow_systems_assets_AssetImage(_system,_id,info);
};
snow_systems_assets_AssetImage.provider = function(_app,_path) {
	return _app.assets.module.image_info_from_load(_path);
};
snow_systems_assets_AssetImage.processor = function(_app,_id,_data) {
	if(_data == null) return snow_api_Promise.reject(snow_types_Error.error("AssetImage processor: data was null"));
	return _app.assets.module.image_info_from_bytes(_id,_data);
};
snow_systems_assets_AssetImage.__super__ = snow_systems_assets_Asset;
snow_systems_assets_AssetImage.prototype = $extend(snow_systems_assets_Asset.prototype,{
	reload: function() {
		var _g = this;
		this.loaded = false;
		return new snow_api_Promise(function(resolve,reject) {
			var _load = _g.system.app.io.data_flow(haxe_io_Path.join([_g.system.root,_g.id]),null,snow_systems_assets_AssetImage.provider);
			_load.then(function(_image) {
				_g.set_image(_image);
				resolve(_g);
			}).error(reject);
		});
	}
	,destroy: function() {
		this.image.destroy();
		this.set_image(null);
	}
	,reload_from_bytes: function(_bytes) {
		var _g = this;
		this.loaded = false;
		return new snow_api_Promise(function(resolve,reject) {
			var _load = _g.system.module.image_info_from_bytes(_g.id,_bytes);
			_load.then(function(_image) {
				_g.set_image(_image);
				resolve(_g);
			}).error(reject);
		});
	}
	,reload_from_pixels: function(_width,_height,_pixels) {
		this.loaded = false;
		this.set_image(this.system.module.image_info_from_pixels(this.id,_width,_height,_pixels));
	}
	,set_image: function(_image) {
		this.loaded = _image != null;
		return this.image = _image;
	}
	,__class__: snow_systems_assets_AssetImage
	,__properties__: {set_image:"set_image"}
});
var snow_systems_assets_AssetAudio = function(_system,_id,_audio) {
	snow_systems_assets_Asset.call(this,_system,_id,5);
	this.set_audio(_audio);
};
$hxClasses["snow.systems.assets.AssetAudio"] = snow_systems_assets_AssetAudio;
snow_systems_assets_AssetAudio.__name__ = ["snow","systems","assets","AssetAudio"];
snow_systems_assets_AssetAudio.load = function(_system,_id,_is_stream) {
	if(_is_stream == null) _is_stream = false;
	if(_id == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_id was null" + ""));
	if(_system == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_system was null" + ""));
	return new snow_systems_assets_AssetAudio(_system,_id,null).reload(_is_stream);
};
snow_systems_assets_AssetAudio.load_from_bytes = function(_system,_id,_bytes,_format) {
	if(_id == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_id was null" + ""));
	if(_bytes == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_bytes was null" + ""));
	if(_system == null) throw new js__$Boot_HaxeError(snow_api_DebugError.null_assertion("_system was null" + ""));
	return new snow_systems_assets_AssetAudio(_system,_id,null).reload_from_bytes(_bytes,_format);
};
snow_systems_assets_AssetAudio.__super__ = snow_systems_assets_Asset;
snow_systems_assets_AssetAudio.prototype = $extend(snow_systems_assets_Asset.prototype,{
	reload: function(_is_stream) {
		if(_is_stream == null) _is_stream = false;
		var _g = this;
		this.loaded = false;
		return new snow_api_Promise(function(resolve,reject) {
			var _load = _g.system.app.audio.module.data_from_load(haxe_io_Path.join([_g.system.root,_g.id]),_is_stream);
			_load.then(function(_audio) {
				_g.set_audio(_audio);
				resolve(_g);
			}).error(reject);
		});
	}
	,destroy: function() {
		this.audio.destroy();
		this.set_audio(null);
	}
	,reload_from_bytes: function(_bytes,_format) {
		var _g = this;
		this.loaded = false;
		return new snow_api_Promise(function(resolve,reject) {
			var _load = _g.system.app.audio.module.data_from_bytes(_g.id,_bytes,_format);
			_load.then(function(_audio) {
				_g.set_audio(_audio);
				resolve(_g);
			}).error(reject);
		});
	}
	,set_audio: function(_audio) {
		this.loaded = _audio != null;
		return this.audio = _audio;
	}
	,__class__: snow_systems_assets_AssetAudio
	,__properties__: {set_audio:"set_audio"}
});
var snow_systems_assets_AssetBytes = function(_system,_id,_bytes) {
	snow_systems_assets_Asset.call(this,_system,_id,1);
	this.set_bytes(_bytes);
};
$hxClasses["snow.systems.assets.AssetBytes"] = snow_systems_assets_AssetBytes;
snow_systems_assets_AssetBytes.__name__ = ["snow","systems","assets","AssetBytes"];
snow_systems_assets_AssetBytes.load = function(_system,_id) {
	return new snow_systems_assets_AssetBytes(_system,_id,null).reload();
};
snow_systems_assets_AssetBytes.__super__ = snow_systems_assets_Asset;
snow_systems_assets_AssetBytes.prototype = $extend(snow_systems_assets_Asset.prototype,{
	reload: function() {
		var _g = this;
		return new snow_api_Promise(function(resolve,reject) {
			_g.system.app.io.data_flow(haxe_io_Path.join([_g.system.root,_g.id])).then(function(_bytes) {
				_g.set_bytes(_bytes);
				resolve(_g);
			}).error(reject);
		});
	}
	,destroy: function() {
		this.set_bytes(null);
	}
	,set_bytes: function(_bytes) {
		this.loaded = _bytes != null;
		return this.bytes = _bytes;
	}
	,__class__: snow_systems_assets_AssetBytes
	,__properties__: {set_bytes:"set_bytes"}
});
var snow_systems_assets_AssetText = function(_system,_id,_text) {
	snow_systems_assets_Asset.call(this,_system,_id,2);
	this.set_text(_text);
};
$hxClasses["snow.systems.assets.AssetText"] = snow_systems_assets_AssetText;
snow_systems_assets_AssetText.__name__ = ["snow","systems","assets","AssetText"];
snow_systems_assets_AssetText.load = function(_system,_id) {
	return new snow_systems_assets_AssetText(_system,_id,null).reload();
};
snow_systems_assets_AssetText.processor = function(_app,_id,_data) {
	if(_data == null) return snow_api_Promise.reject(snow_types_Error.error("AssetText processor: data was null"));
	var _string = new haxe_io_Bytes(new Uint8Array(_data.buffer)).toString();
	_data = null;
	return snow_api_Promise.resolve(_string);
};
snow_systems_assets_AssetText.__super__ = snow_systems_assets_Asset;
snow_systems_assets_AssetText.prototype = $extend(snow_systems_assets_Asset.prototype,{
	reload: function() {
		var _g = this;
		return new snow_api_Promise(function(resolve,reject) {
			_g.system.app.io.data_flow(haxe_io_Path.join([_g.system.root,_g.id]),snow_systems_assets_AssetText.processor).then(function(_text) {
				_g.set_text(_text);
				resolve(_g);
			}).error(reject);
		});
	}
	,destroy: function() {
		this.set_text(null);
	}
	,set_text: function(_text) {
		this.loaded = _text != null;
		return this.text = _text;
	}
	,__class__: snow_systems_assets_AssetText
	,__properties__: {set_text:"set_text"}
});
var snow_systems_assets_AssetJSON = function(_system,_id,_json) {
	snow_systems_assets_Asset.call(this,_system,_id,3);
	this.set_json(_json);
};
$hxClasses["snow.systems.assets.AssetJSON"] = snow_systems_assets_AssetJSON;
snow_systems_assets_AssetJSON.__name__ = ["snow","systems","assets","AssetJSON"];
snow_systems_assets_AssetJSON.load = function(_system,_id) {
	return new snow_systems_assets_AssetJSON(_system,_id,null).reload();
};
snow_systems_assets_AssetJSON.processor = function(_app,_id,_data) {
	if(_data == null) return snow_api_Promise.reject(snow_types_Error.error("AssetJSON: data was null"));
	return new snow_api_Promise(function(resolve,reject) {
		var _data_json = null;
		try {
			_data_json = JSON.parse(new haxe_io_Bytes(new Uint8Array(_data.buffer)).toString());
			_data = null;
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			_data = null;
			return reject(snow_types_Error.parse(e));
		}
		return resolve(_data_json);
	});
};
snow_systems_assets_AssetJSON.__super__ = snow_systems_assets_Asset;
snow_systems_assets_AssetJSON.prototype = $extend(snow_systems_assets_Asset.prototype,{
	reload: function() {
		var _g = this;
		return new snow_api_Promise(function(resolve,reject) {
			_g.system.app.io.data_flow(haxe_io_Path.join([_g.system.root,_g.id]),snow_systems_assets_AssetJSON.processor).then(function(_json) {
				_g.set_json(_json);
				resolve(_g);
			}).error(reject);
		});
	}
	,destroy: function() {
		this.set_json(null);
	}
	,set_json: function(_json) {
		this.loaded = _json != null;
		return this.json = _json;
	}
	,__class__: snow_systems_assets_AssetJSON
	,__properties__: {set_json:"set_json"}
});
var snow_systems_assets_Assets = function(_app) {
	this.root = "";
	this.app = _app;
	this.module = new snow_core_web_assets_Assets(this.app);
};
$hxClasses["snow.systems.assets.Assets"] = snow_systems_assets_Assets;
snow_systems_assets_Assets.__name__ = ["snow","systems","assets","Assets"];
snow_systems_assets_Assets.prototype = {
	shutdown: function() {
		this.module.shutdown();
	}
	,path: function(_id) {
		return haxe_io_Path.join([this.root,_id]);
	}
	,bytes: function(_id) {
		return snow_systems_assets_AssetBytes.load(this,_id);
	}
	,text: function(_id) {
		return snow_systems_assets_AssetText.load(this,_id);
	}
	,json: function(_id) {
		return snow_systems_assets_AssetJSON.load(this,_id);
	}
	,image: function(_id) {
		return snow_systems_assets_AssetImage.load(this,_id);
	}
	,image_from_bytes: function(_id,_bytes) {
		return snow_systems_assets_AssetImage.load_from_bytes(this,_id,_bytes);
	}
	,image_from_pixels: function(_id,_width,_height,_pixels) {
		return snow_systems_assets_AssetImage.load_from_pixels(this,_id,_width,_height,_pixels);
	}
	,audio: function(_id,_is_stream) {
		if(_is_stream == null) _is_stream = false;
		return snow_systems_assets_AssetAudio.load(this,_id,_is_stream);
	}
	,audio_from_bytes: function(_id,_bytes,_format) {
		return snow_systems_assets_AssetAudio.load_from_bytes(this,_id,_bytes,_format);
	}
	,__class__: snow_systems_assets_Assets
};
var snow_systems_audio_Audio = function(_app) {
	this.active = false;
	this.app = _app;
	this.module = new snow_modules_webaudio_Audio(this.app);
	this.emitter = new snow_api_Emitter();
	this.active = this.module.active;
};
$hxClasses["snow.systems.audio.Audio"] = snow_systems_audio_Audio;
snow_systems_audio_Audio.__name__ = ["snow","systems","audio","Audio"];
snow_systems_audio_Audio.prototype = {
	off_Int: function(_event,_handler) {
		return this.emitter.off(_event,_handler);
	}
	,on_Int: function(_event,_handler) {
		this.emitter.on(_event,_handler);
	}
	,emit_Int: function(_event,_data) {
		this.emitter.emit(_event,_data);
	}
	,emit_snow_systems_audio_AudioSource: function(_event,_data) {
		this.emitter.emit(_event,_data);
	}
	,play: function(_source,_volume,_paused) {
		if(_paused == null) _paused = false;
		if(_volume == null) _volume = 1.0;
		if(!this.active) return -1;
		return this.module.play(_source,_volume,_paused);
	}
	,loop: function(_source,_volume,_paused) {
		if(_paused == null) _paused = false;
		if(_volume == null) _volume = 1.0;
		if(!this.active) return -1;
		return this.module.loop(_source,_volume,_paused);
	}
	,pause: function(_handle) {
		if(!this.active) return;
		this.module.pause(_handle);
	}
	,unpause: function(_handle) {
		if(!this.active) return;
		this.module.unpause(_handle);
	}
	,stop: function(_handle) {
		if(!this.active) return;
		this.module.stop(_handle);
	}
	,volume: function(_handle,_volume) {
		if(!this.active) return;
		this.module.volume(_handle,_volume);
	}
	,pan: function(_handle,_pan) {
		if(!this.active) return;
		this.module.pan(_handle,_pan);
	}
	,pitch: function(_handle,_pitch) {
		if(!this.active) return;
		this.module.pitch(_handle,_pitch);
	}
	,position: function(_handle,_position) {
		if(!this.active) return;
		this.module.position(_handle,_position);
	}
	,state_of: function(_handle) {
		return this.module.state_of(_handle);
	}
	,loop_of: function(_handle) {
		if(!this.active) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("active" + (" ( " + "audio is suspended, queries are invalid" + " )")));
		return this.module.loop_of(_handle);
	}
	,instance_of: function(_handle) {
		if(!this.active) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("active" + (" ( " + "audio is suspended, queries are invalid" + " )")));
		return this.module.instance_of(_handle);
	}
	,volume_of: function(_handle) {
		if(!this.active) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("active" + (" ( " + "audio is suspended, queries are invalid" + " )")));
		return this.module.volume_of(_handle);
	}
	,pan_of: function(_handle) {
		if(!this.active) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("active" + (" ( " + "audio is suspended, queries are invalid" + " )")));
		return this.module.pan_of(_handle);
	}
	,pitch_of: function(_handle) {
		if(!this.active) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("active" + (" ( " + "audio is suspended, queries are invalid" + " )")));
		return this.module.pitch_of(_handle);
	}
	,position_of: function(_handle) {
		if(!this.active) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("active" + (" ( " + "audio is suspended, queries are invalid" + " )")));
		return this.module.position_of(_handle);
	}
	,suspend: function() {
		if(!this.active) return;
		haxe_Log.trace("    i / audio / " + "suspending sound context",{ fileName : "Audio.hx", lineNumber : 152, className : "snow.systems.audio.Audio", methodName : "suspend"});
		this.active = false;
		this.module.suspend();
	}
	,resume: function() {
		if(this.active || !this.module.active) return;
		haxe_Log.trace("    i / audio / " + "resuming sound context",{ fileName : "Audio.hx", lineNumber : 164, className : "snow.systems.audio.Audio", methodName : "resume"});
		this.active = true;
		this.module.resume();
	}
	,onevent: function(_event) {
		this.module.onevent(_event);
		if(_event.type == 8) {
			var _g = _event.window.type;
			switch(_g) {
			case 7:
				this.suspend();
				break;
			case 9:
				this.resume();
				break;
			default:
			}
		}
	}
	,shutdown: function() {
		this.active = false;
		this.module.shutdown();
	}
	,__class__: snow_systems_audio_Audio
};
var snow_systems_audio_AudioInstance = function(_source,_handle) {
	this.destroyed = false;
	this.source = _source;
	this.handle = _handle;
};
$hxClasses["snow.systems.audio.AudioInstance"] = snow_systems_audio_AudioInstance;
snow_systems_audio_AudioInstance.__name__ = ["snow","systems","audio","AudioInstance"];
snow_systems_audio_AudioInstance.prototype = {
	tick: function() {
	}
	,has_ended: function() {
		if(!(this.destroyed == false)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("destroyed == false" + (" ( " + "snow / Audio / Instance has_ended queried after being destroyed" + " )")));
		return this.source.app.audio.state_of(this.handle) == 2;
	}
	,destroy: function() {
		if(!(this.destroyed == false)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("destroyed == false" + (" ( " + "snow / Audio / Instance being destroyed more than once" + " )")));
		this.source.app.audio.emit_Int(1,this.handle);
		this.source.instance_killed(this);
		this.destroyed = true;
		this.source = null;
		this.handle = -1;
	}
	,data_get: function(_into,_start,_length,_into_result) {
		if(!(this.destroyed == false)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("destroyed == false" + (" ( " + "snow / Audio / Instance data_get queried after being destroyed" + " )")));
		return this.source.data.portion(_into,_start,_length,_into_result);
	}
	,data_seek: function(_to_samples) {
		if(!(this.destroyed == false)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("destroyed == false" + (" ( " + "snow / Audio / Instance data_seek queried after being destroyed" + " )")));
		return this.source.data.seek(_to_samples);
	}
	,__class__: snow_systems_audio_AudioInstance
};
var snow_systems_audio_AudioSource = function(_app,_data) {
	this.stream_buffer_count = 2;
	this.stream_buffer_length = 176400;
	this.app = _app;
	this.data = _data;
	this.instances = [];
};
$hxClasses["snow.systems.audio.AudioSource"] = snow_systems_audio_AudioSource;
snow_systems_audio_AudioSource.__name__ = ["snow","systems","audio","AudioSource"];
snow_systems_audio_AudioSource.prototype = {
	instance: function(_handle) {
		var _instance = new snow_systems_audio_AudioInstance(this,_handle);
		if(HxOverrides.indexOf(this.instances,_instance,0) == -1) this.instances.push(_instance);
		return _instance;
	}
	,bytes_to_seconds: function(_bytes) {
		var _bits_per_sample = 16;
		var _word;
		if(_bits_per_sample == 16) _word = 2; else _word = 1;
		var _sample_frames = this.data.rate * this.data.channels * _word;
		return _bytes / _sample_frames;
	}
	,seconds_to_bytes: function(_seconds) {
		var _bits_per_sample = 16;
		var _word;
		if(_bits_per_sample == 16) _word = 2; else _word = 1;
		var _sample_frames = this.data.rate * this.data.channels * _word;
		return _seconds * _sample_frames | 0;
	}
	,duration: function() {
		return this.bytes_to_seconds(this.data.length);
	}
	,destroy: function() {
		var c = this.instances.length;
		var i = 0;
		haxe_Log.trace("i / audiosource / " + ("destroy " + this.data.id + ", stream=" + Std.string(this.data.is_stream) + ", instances=" + c),{ fileName : "AudioSource.hx", lineNumber : 83, className : "snow.systems.audio.AudioSource", methodName : "destroy"});
		this.app.audio.emit_snow_systems_audio_AudioSource(2,this);
		while(i < c) {
			var _instance = this.instances.pop();
			_instance.destroy();
			_instance = null;
			i++;
		}
		this.data.destroy();
		this.data = null;
		this.instances = null;
		this.app = null;
	}
	,instance_killed: function(_instance) {
		HxOverrides.remove(this.instances,_instance);
	}
	,__class__: snow_systems_audio_AudioSource
};
var snow_systems_input_Input = function(_app) {
	this.touch_count = 0;
	this.gamepad_init_count = 16;
	this.app = _app;
	this.event = new snow_types_InputEvent();
	this.key_event = new snow_types_KeyEvent();
	this.text_event = new snow_types_TextEvent();
	this.mouse_event = new snow_types_MouseEvent();
	this.touch_event = new snow_types_TouchEvent();
	this.gamepad_event = new snow_types_GamepadEvent();
	this.mod_state = new snow_types_ModState();
	this.mod_state.none = true;
	this.key_code_pressed = new haxe_ds_IntMap();
	this.key_code_down = new haxe_ds_IntMap();
	this.key_code_released = new haxe_ds_IntMap();
	this.scan_code_pressed = new haxe_ds_IntMap();
	this.scan_code_down = new haxe_ds_IntMap();
	this.scan_code_released = new haxe_ds_IntMap();
	this.mouse_button_pressed = new haxe_ds_IntMap();
	this.mouse_button_down = new haxe_ds_IntMap();
	this.mouse_button_released = new haxe_ds_IntMap();
	this.gamepad_button_pressed = new haxe_ds_IntMap();
	this.gamepad_button_down = new haxe_ds_IntMap();
	this.gamepad_button_released = new haxe_ds_IntMap();
	this.gamepad_axis_values = new haxe_ds_IntMap();
	var _g1 = 0;
	var _g = this.gamepad_init_count;
	while(_g1 < _g) {
		var i = _g1++;
		var value = new haxe_ds_IntMap();
		this.gamepad_button_pressed.h[i] = value;
		var value1 = new haxe_ds_IntMap();
		this.gamepad_button_down.h[i] = value1;
		var value2 = new haxe_ds_IntMap();
		this.gamepad_button_released.h[i] = value2;
		var value3 = new haxe_ds_IntMap();
		this.gamepad_axis_values.h[i] = value3;
	}
	this.touches_down = new haxe_ds_IntMap();
};
$hxClasses["snow.systems.input.Input"] = snow_systems_input_Input;
snow_systems_input_Input.__name__ = ["snow","systems","input","Input"];
snow_systems_input_Input.prototype = {
	shutdown: function() {
	}
	,keypressed: function(_code) {
		return this.key_code_pressed.h.hasOwnProperty(_code);
	}
	,keyreleased: function(_code) {
		return this.key_code_released.h.hasOwnProperty(_code);
	}
	,keydown: function(_code) {
		return this.key_code_down.h.hasOwnProperty(_code);
	}
	,scanpressed: function(_code) {
		return this.scan_code_pressed.h.hasOwnProperty(_code);
	}
	,scanreleased: function(_code) {
		return this.scan_code_released.h.hasOwnProperty(_code);
	}
	,scandown: function(_code) {
		return this.scan_code_down.h.hasOwnProperty(_code);
	}
	,mousepressed: function(_button) {
		return this.mouse_button_pressed.h.hasOwnProperty(_button);
	}
	,mousereleased: function(_button) {
		return this.mouse_button_released.h.hasOwnProperty(_button);
	}
	,mousedown: function(_button) {
		return this.mouse_button_down.h.hasOwnProperty(_button);
	}
	,gamepadpressed: function(_gamepad,_button) {
		var _gamepad_state = this.gamepad_button_pressed.h[_gamepad];
		if(_gamepad_state != null) return _gamepad_state.h.hasOwnProperty(_button); else return false;
	}
	,gamepadreleased: function(_gamepad,_button) {
		var _gamepad_state = this.gamepad_button_released.h[_gamepad];
		if(_gamepad_state != null) return _gamepad_state.h.hasOwnProperty(_button); else return false;
	}
	,gamepaddown: function(_gamepad,_button) {
		var _gamepad_state = this.gamepad_button_down.h[_gamepad];
		if(_gamepad_state != null) return _gamepad_state.h.hasOwnProperty(_button); else return false;
	}
	,gamepadaxis: function(_gamepad,_axis) {
		var _gamepad_state = this.gamepad_axis_values.h[_gamepad];
		if(_gamepad_state != null) {
			if(_gamepad_state.h.hasOwnProperty(_axis)) return _gamepad_state.h[_axis];
		}
		return 0;
	}
	,dispatch_key_down_event: function(keycode,scancode,repeat,mod,timestamp,window_id) {
		if(!repeat) {
			this.key_code_pressed.h[keycode] = false;
			this.key_code_down.h[keycode] = true;
			this.scan_code_pressed.h[scancode] = false;
			this.scan_code_down.h[scancode] = true;
		}
		this.key_event.set(1,keycode,scancode,repeat,mod);
		this.event.set_key(this.key_event,window_id,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.onkeydown(keycode,scancode,repeat,mod,timestamp,window_id);
	}
	,dispatch_key_up_event: function(keycode,scancode,repeat,mod,timestamp,window_id) {
		this.key_code_released.h[keycode] = false;
		this.key_code_down.remove(keycode);
		this.scan_code_released.h[scancode] = false;
		this.scan_code_down.remove(scancode);
		this.key_event.set(2,keycode,scancode,repeat,mod);
		this.event.set_key(this.key_event,window_id,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.onkeyup(keycode,scancode,repeat,mod,timestamp,window_id);
	}
	,dispatch_text_event: function(text,start,length,type,timestamp,window_id) {
		this.text_event.set(type,text,start,length);
		this.event.set_text(this.text_event,window_id,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.ontextinput(text,start,length,type,timestamp,window_id);
	}
	,dispatch_mouse_move_event: function(x,y,xrel,yrel,timestamp,window_id) {
		this.mouse_event.set(1,x,y,xrel,yrel,0,0,0);
		this.event.set_mouse(this.mouse_event,window_id,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.onmousemove(x,y,xrel,yrel,timestamp,window_id);
	}
	,dispatch_mouse_down_event: function(x,y,button,timestamp,window_id) {
		this.mouse_button_pressed.h[button] = false;
		this.mouse_button_down.h[button] = true;
		this.mouse_event.set(2,x,y,0,0,button,0,0);
		this.event.set_mouse(this.mouse_event,window_id,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.onmousedown(x,y,button,timestamp,window_id);
	}
	,dispatch_mouse_up_event: function(x,y,button,timestamp,window_id) {
		this.mouse_button_released.h[button] = false;
		this.mouse_button_down.remove(button);
		this.mouse_event.set(3,x,y,0,0,button,0,0);
		this.event.set_mouse(this.mouse_event,window_id,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.onmouseup(x,y,button,timestamp,window_id);
	}
	,dispatch_mouse_wheel_event: function(x,y,timestamp,window_id) {
		this.mouse_event.set(4,0,0,0,0,0,x,y);
		this.event.set_mouse(this.mouse_event,window_id,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.onmousewheel(x,y,timestamp,window_id);
	}
	,dispatch_touch_down_event: function(x,y,dx,dy,touch_id,timestamp) {
		if(!this.touches_down.h.hasOwnProperty(touch_id)) {
			this.touch_count++;
			this.touches_down.h[touch_id] = true;
		}
		this.touch_event.set(2,touch_id,x,y,dx,dy);
		this.event.set_touch(this.touch_event,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.ontouchdown(x,y,dx,dy,touch_id,timestamp);
	}
	,dispatch_touch_up_event: function(x,y,dx,dy,touch_id,timestamp) {
		this.touch_event.set(3,touch_id,x,y,dx,dy);
		this.event.set_touch(this.touch_event,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.ontouchup(x,y,dx,dy,touch_id,timestamp);
		if(this.touches_down.remove(touch_id)) this.touch_count--;
	}
	,dispatch_touch_move_event: function(x,y,dx,dy,touch_id,timestamp) {
		this.touch_event.set(1,touch_id,x,y,dx,dy);
		this.event.set_touch(this.touch_event,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.ontouchmove(x,y,dx,dy,touch_id,timestamp);
	}
	,dispatch_gamepad_axis_event: function(gamepad,axis,value,timestamp) {
		if(!this.gamepad_axis_values.h.hasOwnProperty(gamepad)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("gamepad_axis_values.exists(gamepad)" + (" ( " + ("gamepad with id " + gamepad + " not pre-inited? Is gamepad_init_count too low, or the gamepad id not sequential from 0?") + " )")));
		var this1 = this.gamepad_axis_values.h[gamepad];
		this1.set(axis,value);
		this.gamepad_event.set_axis(gamepad,axis,value);
		this.event.set_gamepad(this.gamepad_event,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.ongamepadaxis(gamepad,axis,value,timestamp);
	}
	,dispatch_gamepad_button_down_event: function(gamepad,button,value,timestamp) {
		if(!this.gamepad_button_pressed.h.hasOwnProperty(gamepad)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("gamepad_button_pressed.exists(gamepad)" + (" ( " + ("gamepad with id " + gamepad + " not pre-inited? Is gamepad_init_count too low, or the gamepad id not sequential from 0?") + " )")));
		if(!this.gamepad_button_down.h.hasOwnProperty(gamepad)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("gamepad_button_down.exists(gamepad)" + (" ( " + ("gamepad with id " + gamepad + " not pre-inited? Is gamepad_init_count too low, or the gamepad id not sequential from 0?") + " )")));
		var this1 = this.gamepad_button_pressed.h[gamepad];
		this1.set(button,false);
		var this2 = this.gamepad_button_down.h[gamepad];
		this2.set(button,true);
		this.gamepad_event.set_button(2,gamepad,button,value);
		this.event.set_gamepad(this.gamepad_event,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.ongamepaddown(gamepad,button,value,timestamp);
	}
	,dispatch_gamepad_button_up_event: function(gamepad,button,value,timestamp) {
		if(!this.gamepad_button_released.h.hasOwnProperty(gamepad)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("gamepad_button_released.exists(gamepad)" + (" ( " + ("gamepad with id " + gamepad + " not pre-inited? Is gamepad_init_count too low, or the gamepad id not sequential from 0?") + " )")));
		if(!this.gamepad_button_down.h.hasOwnProperty(gamepad)) throw new js__$Boot_HaxeError(snow_api_DebugError.assertion("gamepad_button_down.exists(gamepad)" + (" ( " + ("gamepad with id " + gamepad + " not pre-inited? Is gamepad_init_count too low, or the gamepad id not sequential from 0?") + " )")));
		var this1 = this.gamepad_button_released.h[gamepad];
		this1.set(button,false);
		var this2 = this.gamepad_button_down.h[gamepad];
		this2.remove(button);
		this.gamepad_event.set_button(3,gamepad,button,value);
		this.event.set_gamepad(this.gamepad_event,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.ongamepadup(gamepad,button,value,timestamp);
	}
	,dispatch_gamepad_device_event: function(gamepad,id,type,timestamp) {
		this.gamepad_event.set_device(gamepad,id,type);
		this.event.set_gamepad(this.gamepad_event,timestamp);
		this.app.dispatch_input_event(this.event);
		this.app.host.ongamepaddevice(gamepad,id,type,timestamp);
	}
	,onevent: function(_event) {
		if(_event.type == 3) {
			this._update_keystate();
			this._update_gamepadstate();
			this._update_mousestate();
		}
	}
	,_update_mousestate: function() {
		var $it0 = this.mouse_button_pressed.keys();
		while( $it0.hasNext() ) {
			var _code = $it0.next();
			if(this.mouse_button_pressed.h[_code]) this.mouse_button_pressed.remove(_code); else this.mouse_button_pressed.h[_code] = true;
		}
		var $it1 = this.mouse_button_released.keys();
		while( $it1.hasNext() ) {
			var _code1 = $it1.next();
			if(this.mouse_button_released.h[_code1]) this.mouse_button_released.remove(_code1); else this.mouse_button_released.h[_code1] = true;
		}
	}
	,_update_gamepadstate: function() {
		var $it0 = this.gamepad_button_pressed.iterator();
		while( $it0.hasNext() ) {
			var _gamepad_pressed = $it0.next();
			var $it1 = _gamepad_pressed.keys();
			while( $it1.hasNext() ) {
				var _button = $it1.next();
				if(_gamepad_pressed.h[_button]) _gamepad_pressed.remove(_button); else _gamepad_pressed.h[_button] = true;
			}
		}
		var $it2 = this.gamepad_button_released.iterator();
		while( $it2.hasNext() ) {
			var _gamepad_released = $it2.next();
			var $it3 = _gamepad_released.keys();
			while( $it3.hasNext() ) {
				var _button1 = $it3.next();
				if(_gamepad_released.h[_button1]) _gamepad_released.remove(_button1); else _gamepad_released.h[_button1] = true;
			}
		}
	}
	,_update_keystate: function() {
		var $it0 = this.key_code_pressed.keys();
		while( $it0.hasNext() ) {
			var _code = $it0.next();
			if(this.key_code_pressed.h[_code]) this.key_code_pressed.remove(_code); else this.key_code_pressed.h[_code] = true;
		}
		var $it1 = this.key_code_released.keys();
		while( $it1.hasNext() ) {
			var _code1 = $it1.next();
			if(this.key_code_released.h[_code1]) this.key_code_released.remove(_code1); else this.key_code_released.h[_code1] = true;
		}
		var $it2 = this.scan_code_pressed.keys();
		while( $it2.hasNext() ) {
			var _code2 = $it2.next();
			if(this.scan_code_pressed.h[_code2]) this.scan_code_pressed.remove(_code2); else this.scan_code_pressed.h[_code2] = true;
		}
		var $it3 = this.scan_code_released.keys();
		while( $it3.hasNext() ) {
			var _code3 = $it3.next();
			if(this.scan_code_released.h[_code3]) this.scan_code_released.remove(_code3); else this.scan_code_released.h[_code3] = true;
		}
	}
	,__class__: snow_systems_input_Input
};
var snow_systems_input_Scancodes = function() { };
$hxClasses["snow.systems.input.Scancodes"] = snow_systems_input_Scancodes;
snow_systems_input_Scancodes.__name__ = ["snow","systems","input","Scancodes"];
snow_systems_input_Scancodes.$name = function(scancode) {
	var res = null;
	if(scancode >= 0 && scancode < snow_systems_input_Scancodes.scancode_names.length) res = snow_systems_input_Scancodes.scancode_names[scancode];
	if(res != null) return res; else return "";
};
var snow_systems_input_Keycodes = function() { };
$hxClasses["snow.systems.input.Keycodes"] = snow_systems_input_Keycodes;
snow_systems_input_Keycodes.__name__ = ["snow","systems","input","Keycodes"];
snow_systems_input_Keycodes.from_scan = function(scancode) {
	return scancode | snow_systems_input_Scancodes.MASK;
};
snow_systems_input_Keycodes.to_scan = function(keycode) {
	if((keycode & snow_systems_input_Scancodes.MASK) != 0) return keycode & ~snow_systems_input_Scancodes.MASK;
	switch(keycode) {
	case 13:
		return snow_systems_input_Scancodes.enter;
	case 27:
		return snow_systems_input_Scancodes.escape;
	case 8:
		return snow_systems_input_Scancodes.backspace;
	case 9:
		return snow_systems_input_Scancodes.tab;
	case 32:
		return snow_systems_input_Scancodes.space;
	case 47:
		return snow_systems_input_Scancodes.slash;
	case 48:
		return snow_systems_input_Scancodes.key_0;
	case 49:
		return snow_systems_input_Scancodes.key_1;
	case 50:
		return snow_systems_input_Scancodes.key_2;
	case 51:
		return snow_systems_input_Scancodes.key_3;
	case 52:
		return snow_systems_input_Scancodes.key_4;
	case 53:
		return snow_systems_input_Scancodes.key_5;
	case 54:
		return snow_systems_input_Scancodes.key_6;
	case 55:
		return snow_systems_input_Scancodes.key_7;
	case 56:
		return snow_systems_input_Scancodes.key_8;
	case 57:
		return snow_systems_input_Scancodes.key_9;
	case 59:
		return snow_systems_input_Scancodes.semicolon;
	case 61:
		return snow_systems_input_Scancodes.equals;
	case 91:
		return snow_systems_input_Scancodes.leftbracket;
	case 92:
		return snow_systems_input_Scancodes.backslash;
	case 93:
		return snow_systems_input_Scancodes.rightbracket;
	case 96:
		return snow_systems_input_Scancodes.grave;
	case 97:
		return snow_systems_input_Scancodes.key_a;
	case 98:
		return snow_systems_input_Scancodes.key_b;
	case 99:
		return snow_systems_input_Scancodes.key_c;
	case 100:
		return snow_systems_input_Scancodes.key_d;
	case 101:
		return snow_systems_input_Scancodes.key_e;
	case 102:
		return snow_systems_input_Scancodes.key_f;
	case 103:
		return snow_systems_input_Scancodes.key_g;
	case 104:
		return snow_systems_input_Scancodes.key_h;
	case 105:
		return snow_systems_input_Scancodes.key_i;
	case 106:
		return snow_systems_input_Scancodes.key_j;
	case 107:
		return snow_systems_input_Scancodes.key_k;
	case 108:
		return snow_systems_input_Scancodes.key_l;
	case 109:
		return snow_systems_input_Scancodes.key_m;
	case 110:
		return snow_systems_input_Scancodes.key_n;
	case 111:
		return snow_systems_input_Scancodes.key_o;
	case 112:
		return snow_systems_input_Scancodes.key_p;
	case 113:
		return snow_systems_input_Scancodes.key_q;
	case 114:
		return snow_systems_input_Scancodes.key_r;
	case 115:
		return snow_systems_input_Scancodes.key_s;
	case 116:
		return snow_systems_input_Scancodes.key_t;
	case 117:
		return snow_systems_input_Scancodes.key_u;
	case 118:
		return snow_systems_input_Scancodes.key_v;
	case 119:
		return snow_systems_input_Scancodes.key_w;
	case 120:
		return snow_systems_input_Scancodes.key_x;
	case 121:
		return snow_systems_input_Scancodes.key_y;
	case 122:
		return snow_systems_input_Scancodes.key_z;
	}
	return snow_systems_input_Scancodes.unknown;
};
snow_systems_input_Keycodes.$name = function(keycode) {
	if((keycode & snow_systems_input_Scancodes.MASK) != 0) return snow_systems_input_Scancodes.$name(keycode & ~snow_systems_input_Scancodes.MASK);
	switch(keycode) {
	case 13:
		return snow_systems_input_Scancodes.$name(snow_systems_input_Scancodes.enter);
	case 27:
		return snow_systems_input_Scancodes.$name(snow_systems_input_Scancodes.escape);
	case 8:
		return snow_systems_input_Scancodes.$name(snow_systems_input_Scancodes.backspace);
	case 9:
		return snow_systems_input_Scancodes.$name(snow_systems_input_Scancodes.tab);
	case 32:
		return snow_systems_input_Scancodes.$name(snow_systems_input_Scancodes.space);
	case 127:
		return snow_systems_input_Scancodes.$name(snow_systems_input_Scancodes["delete"]);
	default:
		var decoder = new haxe_Utf8();
		decoder.__b += String.fromCharCode(keycode);
		return decoder.__b;
	}
};
var snow_systems_io_IO = function(_app) {
	this.string_save_prefix = "slot";
	this.app = _app;
	this.module = new snow_core_web_io_IO(this.app);
};
$hxClasses["snow.systems.io.IO"] = snow_systems_io_IO;
snow_systems_io_IO.__name__ = ["snow","systems","io","IO"];
snow_systems_io_IO.prototype = {
	app_path: function() {
		return this.module.app_path();
	}
	,app_path_prefs: function() {
		return this.module.app_path_prefs();
	}
	,url_open: function(_url) {
		this.module.url_open(_url);
	}
	,data_load: function(_path,_options) {
		return this.module.data_load(_path,_options);
	}
	,data_save: function(_path,_data,_options) {
		return this.module.data_save(_path,_data,_options);
	}
	,data_flow: function(_id,_processor,_provider) {
		var _g = this;
		if(_provider == null) _provider = $bind(this,this.default_provider);
		return new snow_api_Promise(function(resolve,reject) {
			_provider(_g.app,_id).then(function(data) {
				if(_processor != null) _processor(_g.app,_id,data).then(resolve,reject); else resolve(data);
			}).error(reject);
		});
	}
	,string_save_path: function(_slot) {
		if(_slot == null) _slot = 0;
		return this.module.string_save_path(_slot);
	}
	,string_save: function(_key,_value,_slot) {
		if(_slot == null) _slot = 0;
		var _string_map = this.string_slots_sync(_slot);
		var _encoded_key = window.btoa(_key);
		if(_value == null) _string_map.remove(_encoded_key); else {
			var _encoded_value = window.btoa(_value);
			if(__map_reserved[_encoded_key] != null) _string_map.setReserved(_encoded_key,_encoded_value); else _string_map.h[_encoded_key] = _encoded_value;
		}
		var _contents = haxe_Serializer.run(_string_map);
		_contents = window.btoa(_contents);
		return this.module.string_slot_save(_slot,_contents);
	}
	,string_load: function(_key,_slot) {
		if(_slot == null) _slot = 0;
		var _string_map = this.string_slots_sync(_slot);
		var _encoded_key = window.btoa(_key);
		var _encoded_value;
		_encoded_value = __map_reserved[_encoded_key] != null?_string_map.getReserved(_encoded_key):_string_map.h[_encoded_key];
		if(_encoded_value == null) return null;
		return window.atob(_encoded_value);
	}
	,string_destroy: function(_slot) {
		if(_slot == null) _slot = 0;
		if(this.string_slots == null) this.string_slots = new haxe_ds_IntMap(); else this.string_slots.remove(_slot);
		return this.module.string_slot_destroy(_slot);
	}
	,string_slots_sync: function(_slot) {
		if(_slot == null) _slot = 0;
		if(this.string_slots == null) this.string_slots = new haxe_ds_IntMap();
		var _string_map = this.string_slots.h[_slot];
		if(_string_map == null) {
			var _string = this.module.string_slot_load(_slot);
			if(_string == null) _string_map = new haxe_ds_StringMap(); else {
				_string = window.atob(_string);
				_string_map = haxe_Unserializer.run(_string);
			}
			this.string_slots.h[_slot] = _string_map;
		}
		return _string_map;
	}
	,default_provider: function(_app,_id) {
		return this.module.data_load(_id,null);
	}
	,onevent: function(_event) {
		this.module.onevent(_event);
	}
	,shutdown: function() {
		this.module.shutdown();
	}
	,__class__: snow_systems_io_IO
};
var snow_types_Config = function() { };
$hxClasses["snow.types.Config"] = snow_types_Config;
snow_types_Config.__name__ = ["snow","types","Config"];
var snow_types_Error = $hxClasses["snow.types.Error"] = { __ename__ : ["snow","types","Error"], __constructs__ : ["error","init","parse"] };
snow_types_Error.error = function(value) { var $x = ["error",0,value]; $x.__enum__ = snow_types_Error; $x.toString = $estr; return $x; };
snow_types_Error.init = function(value) { var $x = ["init",1,value]; $x.__enum__ = snow_types_Error; $x.toString = $estr; return $x; };
snow_types_Error.parse = function(value) { var $x = ["parse",2,value]; $x.__enum__ = snow_types_Error; $x.toString = $estr; return $x; };
var snow_types__$Types_ApplyType = function() { };
$hxClasses["snow.types._Types.ApplyType"] = snow_types__$Types_ApplyType;
snow_types__$Types_ApplyType.__name__ = ["snow","types","_Types","ApplyType"];
var snow_types__$Types_ExtensionsInit = function() { };
$hxClasses["snow.types._Types.ExtensionsInit"] = snow_types__$Types_ExtensionsInit;
snow_types__$Types_ExtensionsInit.__name__ = ["snow","types","_Types","ExtensionsInit"];
var snow_types__$Types_AssetType_$Impl_$ = {};
$hxClasses["snow.types._Types.AssetType_Impl_"] = snow_types__$Types_AssetType_$Impl_$;
snow_types__$Types_AssetType_$Impl_$.__name__ = ["snow","types","_Types","AssetType_Impl_"];
snow_types__$Types_AssetType_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "at_unknown";
	case 1:
		return "at_bytes";
	case 2:
		return "at_text";
	case 3:
		return "at_json";
	case 4:
		return "at_image";
	case 5:
		return "at_audio";
	default:
		return "" + this1;
	}
};
var snow_types_ImageData = function(_app,_options) {
	this.bpp_source = 4;
	this.bpp = 4;
	this.height_actual = 0;
	this.width_actual = 0;
	this.height = 0;
	this.width = 0;
	this.id = "ImageData";
	this.app = _app;
	if(_options.id == null) _options.id = this.id;
	this.id = _options.id;
	this.width = _options.width;
	this.height = _options.height;
	this.width_actual = _options.width_actual;
	this.height_actual = _options.height_actual;
	this.bpp = _options.bpp;
	this.bpp_source = _options.bpp_source;
	if(_options.pixels == null) _options.pixels = this.pixels;
	this.pixels = _options.pixels;
	_options = null;
};
$hxClasses["snow.types.ImageData"] = snow_types_ImageData;
snow_types_ImageData.__name__ = ["snow","types","ImageData"];
snow_types_ImageData.prototype = {
	destroy: function() {
		this.id = null;
		this.pixels = null;
	}
	,toString: function() {
		return "{ \"ImageData\":true, \"id\":" + this.id + ", \"width\":" + this.width + ", \"height\":" + this.height + ", \"width_actual\":" + this.width_actual + ", \"height_actual\":" + this.height_actual + ", \"bpp\":" + this.bpp + ", \"bpp_source\":" + this.bpp_source + " }";
	}
	,__class__: snow_types_ImageData
};
var snow_types__$Types_AudioFormatType_$Impl_$ = {};
$hxClasses["snow.types._Types.AudioFormatType_Impl_"] = snow_types__$Types_AudioFormatType_$Impl_$;
snow_types__$Types_AudioFormatType_$Impl_$.__name__ = ["snow","types","_Types","AudioFormatType_Impl_"];
snow_types__$Types_AudioFormatType_$Impl_$.toString = function(this1) {
	if(this1 != null) switch(this1) {
	case 0:
		return "af_unknown";
	case 1:
		return "af_custom";
	case 2:
		return "af_ogg";
	case 3:
		return "af_wav";
	case 4:
		return "af_pcm";
	default:
		return "" + this1;
	} else return "" + this1;
};
var snow_types__$Types_AudioEvent_$Impl_$ = {};
$hxClasses["snow.types._Types.AudioEvent_Impl_"] = snow_types__$Types_AudioEvent_$Impl_$;
snow_types__$Types_AudioEvent_$Impl_$.__name__ = ["snow","types","_Types","AudioEvent_Impl_"];
snow_types__$Types_AudioEvent_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "ae_end";
	case 1:
		return "ae_destroyed";
	case 2:
		return "ae_destroyed_source";
	default:
		return "" + this1;
	}
};
var snow_types__$Types_AudioState_$Impl_$ = {};
$hxClasses["snow.types._Types.AudioState_Impl_"] = snow_types__$Types_AudioState_$Impl_$;
snow_types__$Types_AudioState_$Impl_$.__name__ = ["snow","types","_Types","AudioState_Impl_"];
snow_types__$Types_AudioState_$Impl_$.toString = function(this1) {
	switch(this1) {
	case -1:
		return "as_invalid";
	case 0:
		return "as_paused";
	case 1:
		return "as_playing";
	case 2:
		return "as_stopped";
	default:
		return "" + this1;
	}
};
var snow_types__$Types_OpenGLProfile_$Impl_$ = {};
$hxClasses["snow.types._Types.OpenGLProfile_Impl_"] = snow_types__$Types_OpenGLProfile_$Impl_$;
snow_types__$Types_OpenGLProfile_$Impl_$.__name__ = ["snow","types","_Types","OpenGLProfile_Impl_"];
snow_types__$Types_OpenGLProfile_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "compatibility";
	case 1:
		return "core";
	case 2:
		return "gles";
	default:
		return "" + this1;
	}
};
var snow_types_SystemEvent = function() {
};
$hxClasses["snow.types.SystemEvent"] = snow_types_SystemEvent;
snow_types_SystemEvent.__name__ = ["snow","types","SystemEvent"];
snow_types_SystemEvent.prototype = {
	set: function(_type,_window,_input) {
		this.type = _type;
		this.window = _window;
		this.input = _input;
	}
	,toString: function() {
		var _s;
		_s = "{ \"SystemEvent\":true, \"type\":\"" + (function($this) {
			var $r;
			var this1 = $this.type;
			$r = (function($this) {
				var $r;
				switch(this1) {
				case 0:
					$r = "se_unknown";
					break;
				case 1:
					$r = "se_init";
					break;
				case 2:
					$r = "se_ready";
					break;
				case 3:
					$r = "se_tick";
					break;
				case 4:
					$r = "se_freeze";
					break;
				case 5:
					$r = "se_unfreeze";
					break;
				case 7:
					$r = "se_shutdown";
					break;
				case 8:
					$r = "se_window";
					break;
				case 9:
					$r = "se_input";
					break;
				case 10:
					$r = "se_quit";
					break;
				case 11:
					$r = "se_app_terminating";
					break;
				case 12:
					$r = "se_app_lowmemory";
					break;
				case 13:
					$r = "se_app_willenterbackground";
					break;
				case 14:
					$r = "se_app_didenterbackground";
					break;
				case 15:
					$r = "se_app_willenterforeground";
					break;
				case 16:
					$r = "se_app_didenterforeground";
					break;
				default:
					$r = "" + this1;
				}
				return $r;
			}($this));
			return $r;
		}(this)) + "\"";
		if(this.window != null) _s += ", \"window\":" + Std.string(this.window);
		if(this.input != null) _s += ", \"input\":" + Std.string(this.input);
		_s += " }";
		return _s;
	}
	,__class__: snow_types_SystemEvent
};
var snow_types_WindowEvent = function() {
	this.window_id = -1;
	this.timestamp = 0.0;
	this.type = 0;
};
$hxClasses["snow.types.WindowEvent"] = snow_types_WindowEvent;
snow_types_WindowEvent.__name__ = ["snow","types","WindowEvent"];
snow_types_WindowEvent.prototype = {
	set: function(_type,_timestamp,_window_id,_x,_y) {
		this.type = _type;
		this.timestamp = _timestamp;
		this.window_id = _window_id;
		this.x = _x;
		this.y = _y;
	}
	,toString: function() {
		return "{ \"WindowEvent\":true, \"type\":\"" + (function($this) {
			var $r;
			var this1 = $this.type;
			$r = (function($this) {
				var $r;
				switch(this1) {
				case 0:
					$r = "we_unknown";
					break;
				case 1:
					$r = "we_shown";
					break;
				case 2:
					$r = "we_hidden";
					break;
				case 3:
					$r = "we_exposed";
					break;
				case 4:
					$r = "we_moved";
					break;
				case 5:
					$r = "we_resized";
					break;
				case 6:
					$r = "we_size_changed";
					break;
				case 7:
					$r = "we_minimized";
					break;
				case 8:
					$r = "we_maximized";
					break;
				case 9:
					$r = "we_restored";
					break;
				case 10:
					$r = "we_enter";
					break;
				case 11:
					$r = "we_leave";
					break;
				case 12:
					$r = "we_focus_gained";
					break;
				case 13:
					$r = "we_focus_lost";
					break;
				case 14:
					$r = "we_close";
					break;
				default:
					$r = "" + this1;
				}
				return $r;
			}($this));
			return $r;
		}(this)) + "\", \"window\":" + this.window_id + ", \"x\":" + this.x + ", \"y\":" + this.y + ", \"time\":" + this.timestamp + " }";
	}
	,__class__: snow_types_WindowEvent
};
var snow_types_KeyEvent = function() {
};
$hxClasses["snow.types.KeyEvent"] = snow_types_KeyEvent;
snow_types_KeyEvent.__name__ = ["snow","types","KeyEvent"];
snow_types_KeyEvent.prototype = {
	set: function(_type,_keycode,_scancode,_repeat,_mod) {
		this.type = _type;
		this.keycode = _keycode;
		this.scancode = _scancode;
		this.repeat = _repeat;
		this.mod = _mod;
	}
	,toString: function() {
		return "{ \"KeyEvent\":true, \"type\":\"" + (function($this) {
			var $r;
			var this1 = $this.type;
			$r = (function($this) {
				var $r;
				switch(this1) {
				case 0:
					$r = "ke_unknown";
					break;
				case 1:
					$r = "ke_down";
					break;
				case 2:
					$r = "ke_up";
					break;
				default:
					$r = "" + this1;
				}
				return $r;
			}($this));
			return $r;
		}(this)) + "\", \"keycode\":" + this.keycode + ", \"scancode\":" + this.scancode + ", \"repeat\":" + Std.string(this.repeat) + ", \"mod\":" + Std.string(this.mod) + " }";
	}
	,__class__: snow_types_KeyEvent
};
var snow_types_TextEvent = function() {
};
$hxClasses["snow.types.TextEvent"] = snow_types_TextEvent;
snow_types_TextEvent.__name__ = ["snow","types","TextEvent"];
snow_types_TextEvent.prototype = {
	set: function(_type,_text,_start,_length) {
		this.type = _type;
		this.text = _text;
		this.start = _start;
		this.length = _length;
	}
	,toString: function() {
		return "{ \"TextEvent\":true, \"type\":\"" + (function($this) {
			var $r;
			var this1 = $this.type;
			$r = (function($this) {
				var $r;
				switch(this1) {
				case 0:
					$r = "te_unknown";
					break;
				case 1:
					$r = "te_edit";
					break;
				case 2:
					$r = "te_input";
					break;
				default:
					$r = "" + this1;
				}
				return $r;
			}($this));
			return $r;
		}(this)) + "\", \"text\":\"" + this.text + "\", \"start\":" + this.start + ", \"length\":" + this.length + " }";
	}
	,__class__: snow_types_TextEvent
};
var snow_types_MouseEvent = function() {
};
$hxClasses["snow.types.MouseEvent"] = snow_types_MouseEvent;
snow_types_MouseEvent.__name__ = ["snow","types","MouseEvent"];
snow_types_MouseEvent.prototype = {
	set: function(_type,_x,_y,_x_rel,_y_rel,_button,_wheel_x,_wheel_y) {
		this.type = _type;
		this.x = _x;
		this.y = _y;
		this.x_rel = _x_rel;
		this.y_rel = _y_rel;
		this.button = _button;
		this.wheel_x = _wheel_x;
		this.wheel_y = _wheel_y;
	}
	,toString: function() {
		return "{ \"MouseEvent\":true, \"type\":\"" + (function($this) {
			var $r;
			var this1 = $this.type;
			$r = (function($this) {
				var $r;
				switch(this1) {
				case 0:
					$r = "me_unknown";
					break;
				case 1:
					$r = "me_move";
					break;
				case 2:
					$r = "me_down";
					break;
				case 3:
					$r = "me_up";
					break;
				case 4:
					$r = "me_wheel";
					break;
				default:
					$r = "" + this1;
				}
				return $r;
			}($this));
			return $r;
		}(this)) + "\", \"x\":" + this.x + ", \"y\":" + this.y + ", \"button\":" + this.button + ", \"x_rel\":" + this.x_rel + ", \"y_rel\":" + this.y_rel + ", \"wheel_x\":" + this.wheel_x + ", \"wheel_y\":" + this.wheel_y + " }";
	}
	,__class__: snow_types_MouseEvent
};
var snow_types_TouchEvent = function() {
};
$hxClasses["snow.types.TouchEvent"] = snow_types_TouchEvent;
snow_types_TouchEvent.__name__ = ["snow","types","TouchEvent"];
snow_types_TouchEvent.prototype = {
	set: function(_type,_id,_x,_y,_dx,_dy) {
		this.type = _type;
		this.touch_id = _id;
		this.x = _x;
		this.y = _y;
		this.dx = _dx;
		this.dy = _dy;
	}
	,toString: function() {
		return "{ \"TouchEvent\":true, \"type\":\"" + (function($this) {
			var $r;
			var this1 = $this.type;
			$r = (function($this) {
				var $r;
				switch(this1) {
				case 0:
					$r = "te_unknown";
					break;
				case 1:
					$r = "te_move";
					break;
				case 2:
					$r = "te_down";
					break;
				case 3:
					$r = "te_up";
					break;
				default:
					$r = "" + this1;
				}
				return $r;
			}($this));
			return $r;
		}(this)) + "\", \"touch_id\":" + this.touch_id + ", \"x\":" + this.x + ", \"y\":" + this.y + ", \"dx\":" + this.dx + ", \"dy\":" + this.dy + " }";
	}
	,__class__: snow_types_TouchEvent
};
var snow_types_GamepadEvent = function() {
};
$hxClasses["snow.types.GamepadEvent"] = snow_types_GamepadEvent;
snow_types_GamepadEvent.__name__ = ["snow","types","GamepadEvent"];
snow_types_GamepadEvent.prototype = {
	set_axis: function(_gamepad,_axis,_value) {
		this.button = null;
		this.device_id = null;
		this.device_event = null;
		this.axis = _axis;
		this.value = _value;
		this.type = 1;
		this.gamepad = _gamepad;
	}
	,set_button: function(_type,_gamepad,_button,_value) {
		this.axis = null;
		this.device_id = null;
		this.device_event = null;
		this.type = _type;
		this.value = _value;
		this.button = _button;
		this.gamepad = _gamepad;
	}
	,set_device: function(_gamepad,_id,_event) {
		this.axis = null;
		this.value = null;
		this.button = null;
		this.device_id = _id;
		this.device_event = _event;
		this.gamepad = _gamepad;
		this.type = 4;
	}
	,toString: function() {
		return "{ \"GamepadEvent\":true, \"type\":\"" + (function($this) {
			var $r;
			var this1 = $this.type;
			$r = (function($this) {
				var $r;
				switch(this1) {
				case 0:
					$r = "ge_unknown";
					break;
				case 1:
					$r = "ge_axis";
					break;
				case 2:
					$r = "ge_down";
					break;
				case 3:
					$r = "ge_up";
					break;
				case 4:
					$r = "ge_device";
					break;
				default:
					$r = "" + this1;
				}
				return $r;
			}($this));
			return $r;
		}(this)) + "\", \"gamepad\":" + this.gamepad + ", \"axis\":" + this.axis + ", \"button\":" + this.button + ", \"value\":" + this.value + ", \"device_id\":\"" + this.device_id + "\", \"device_event\":\"" + (function($this) {
			var $r;
			var this2 = $this.device_event;
			$r = (function($this) {
				var $r;
				switch(this2) {
				case 0:
					$r = "ge_unknown";
					break;
				case 1:
					$r = "ge_device_added";
					break;
				case 2:
					$r = "ge_device_removed";
					break;
				case 3:
					$r = "ge_device_remapped";
					break;
				default:
					$r = "" + this2;
				}
				return $r;
			}($this));
			return $r;
		}(this)) + "\" }";
	}
	,__class__: snow_types_GamepadEvent
};
var snow_types_InputEvent = function() {
	this.window_id = -1;
	this.timestamp = 0.0;
};
$hxClasses["snow.types.InputEvent"] = snow_types_InputEvent;
snow_types_InputEvent.__name__ = ["snow","types","InputEvent"];
snow_types_InputEvent.prototype = {
	reset: function(_type,_window_id,_timestamp) {
		this.type = _type;
		this.key = null;
		this.text = null;
		this.mouse = null;
		this.touch = null;
		this.gamepad = null;
		this.window_id = _window_id;
		this.timestamp = _timestamp;
	}
	,set_key: function(_event,_window_id,_timestamp) {
		this.type = 1;
		this.key = null;
		this.text = null;
		this.mouse = null;
		this.touch = null;
		this.gamepad = null;
		this.window_id = _window_id;
		this.timestamp = _timestamp;
		this.key = _event;
	}
	,set_text: function(_event,_window_id,_timestamp) {
		this.type = 2;
		this.key = null;
		this.text = null;
		this.mouse = null;
		this.touch = null;
		this.gamepad = null;
		this.window_id = _window_id;
		this.timestamp = _timestamp;
		this.text = _event;
	}
	,set_mouse: function(_event,_window_id,_timestamp) {
		this.type = 3;
		this.key = null;
		this.text = null;
		this.mouse = null;
		this.touch = null;
		this.gamepad = null;
		this.window_id = _window_id;
		this.timestamp = _timestamp;
		this.mouse = _event;
	}
	,set_touch: function(_event,_timestamp) {
		this.type = 4;
		this.key = null;
		this.text = null;
		this.mouse = null;
		this.touch = null;
		this.gamepad = null;
		this.window_id = 0;
		this.timestamp = _timestamp;
		this.touch = _event;
	}
	,set_gamepad: function(_event,_timestamp) {
		this.type = 5;
		this.key = null;
		this.text = null;
		this.mouse = null;
		this.touch = null;
		this.gamepad = null;
		this.window_id = 0;
		this.timestamp = _timestamp;
		this.gamepad = _event;
	}
	,toString: function() {
		var _s;
		_s = "{ \"InputEvent\":true, \"type\":\"" + (function($this) {
			var $r;
			var this1 = $this.type;
			$r = (function($this) {
				var $r;
				switch(this1) {
				case 0:
					$r = "ie_unknown";
					break;
				case 1:
					$r = "ie_key";
					break;
				case 2:
					$r = "ie_text";
					break;
				case 3:
					$r = "ie_mouse";
					break;
				case 4:
					$r = "ie_touch";
					break;
				case 5:
					$r = "ie_gamepad";
					break;
				case 6:
					$r = "ie_joystick";
					break;
				default:
					$r = "" + this1;
				}
				return $r;
			}($this));
			return $r;
		}(this)) + "\"";
		if(this.key != null) _s += ", \"key\":" + Std.string(this.key);
		if(this.text != null) _s += ", \"text\":" + Std.string(this.text);
		if(this.mouse != null) _s += ", \"mouse\":" + Std.string(this.mouse);
		if(this.touch != null) _s += ", \"touch\":" + Std.string(this.touch);
		if(this.gamepad != null) _s += ", \"gamepad\":" + Std.string(this.gamepad);
		_s += "\"window\":" + this.window_id + ", \"time\":" + this.timestamp + " }";
		return _s;
	}
	,__class__: snow_types_InputEvent
};
var snow_types_ModState = function() {
	this.meta = false;
	this.alt = false;
	this.shift = false;
	this.ctrl = false;
	this.mode = false;
	this.caps = false;
	this.num = false;
	this.rmeta = false;
	this.lmeta = false;
	this.ralt = false;
	this.lalt = false;
	this.rctrl = false;
	this.lctrl = false;
	this.rshift = false;
	this.lshift = false;
	this.none = false;
};
$hxClasses["snow.types.ModState"] = snow_types_ModState;
snow_types_ModState.__name__ = ["snow","types","ModState"];
snow_types_ModState.prototype = {
	toString: function() {
		var _s = "{ \"ModState\":true ";
		if(this.none) return _s + ", \"none\":true }";
		if(this.lshift) _s += ", \"lshift\":true";
		if(this.rshift) _s += ", \"rshift\":true";
		if(this.lctrl) _s += ", \"lctrl\":true";
		if(this.rctrl) _s += ", \"rctrl\":true";
		if(this.lalt) _s += ", \"lalt\":true";
		if(this.ralt) _s += ", \"ralt\":true";
		if(this.lmeta) _s += ", \"lmeta\":true";
		if(this.rmeta) _s += ", \"rmeta\":true";
		if(this.num) _s += ", \"num\":true";
		if(this.caps) _s += ", \"caps\":true";
		if(this.mode) _s += ", \"mode\":true";
		if(this.ctrl) _s += ", \"ctrl\":true";
		if(this.shift) _s += ", \"shift\":true";
		if(this.alt) _s += ", \"alt\":true";
		if(this.meta) _s += ", \"meta\":true";
		_s += "}";
		return _s;
	}
	,__class__: snow_types_ModState
};
var snow_types__$Types_KeyEventType_$Impl_$ = {};
$hxClasses["snow.types._Types.KeyEventType_Impl_"] = snow_types__$Types_KeyEventType_$Impl_$;
snow_types__$Types_KeyEventType_$Impl_$.__name__ = ["snow","types","_Types","KeyEventType_Impl_"];
snow_types__$Types_KeyEventType_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "ke_unknown";
	case 1:
		return "ke_down";
	case 2:
		return "ke_up";
	default:
		return "" + this1;
	}
};
var snow_types__$Types_MouseEventType_$Impl_$ = {};
$hxClasses["snow.types._Types.MouseEventType_Impl_"] = snow_types__$Types_MouseEventType_$Impl_$;
snow_types__$Types_MouseEventType_$Impl_$.__name__ = ["snow","types","_Types","MouseEventType_Impl_"];
snow_types__$Types_MouseEventType_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "me_unknown";
	case 1:
		return "me_move";
	case 2:
		return "me_down";
	case 3:
		return "me_up";
	case 4:
		return "me_wheel";
	default:
		return "" + this1;
	}
};
var snow_types__$Types_TouchEventType_$Impl_$ = {};
$hxClasses["snow.types._Types.TouchEventType_Impl_"] = snow_types__$Types_TouchEventType_$Impl_$;
snow_types__$Types_TouchEventType_$Impl_$.__name__ = ["snow","types","_Types","TouchEventType_Impl_"];
snow_types__$Types_TouchEventType_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "te_unknown";
	case 1:
		return "te_move";
	case 2:
		return "te_down";
	case 3:
		return "te_up";
	default:
		return "" + this1;
	}
};
var snow_types__$Types_GamepadEventType_$Impl_$ = {};
$hxClasses["snow.types._Types.GamepadEventType_Impl_"] = snow_types__$Types_GamepadEventType_$Impl_$;
snow_types__$Types_GamepadEventType_$Impl_$.__name__ = ["snow","types","_Types","GamepadEventType_Impl_"];
snow_types__$Types_GamepadEventType_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "ge_unknown";
	case 1:
		return "ge_axis";
	case 2:
		return "ge_down";
	case 3:
		return "ge_up";
	case 4:
		return "ge_device";
	default:
		return "" + this1;
	}
};
var snow_types__$Types_TextEventType_$Impl_$ = {};
$hxClasses["snow.types._Types.TextEventType_Impl_"] = snow_types__$Types_TextEventType_$Impl_$;
snow_types__$Types_TextEventType_$Impl_$.__name__ = ["snow","types","_Types","TextEventType_Impl_"];
snow_types__$Types_TextEventType_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "te_unknown";
	case 1:
		return "te_edit";
	case 2:
		return "te_input";
	default:
		return "" + this1;
	}
};
var snow_types__$Types_GamepadDeviceEventType_$Impl_$ = {};
$hxClasses["snow.types._Types.GamepadDeviceEventType_Impl_"] = snow_types__$Types_GamepadDeviceEventType_$Impl_$;
snow_types__$Types_GamepadDeviceEventType_$Impl_$.__name__ = ["snow","types","_Types","GamepadDeviceEventType_Impl_"];
snow_types__$Types_GamepadDeviceEventType_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "ge_unknown";
	case 1:
		return "ge_device_added";
	case 2:
		return "ge_device_removed";
	case 3:
		return "ge_device_remapped";
	default:
		return "" + this1;
	}
};
var snow_types__$Types_SystemEventType_$Impl_$ = {};
$hxClasses["snow.types._Types.SystemEventType_Impl_"] = snow_types__$Types_SystemEventType_$Impl_$;
snow_types__$Types_SystemEventType_$Impl_$.__name__ = ["snow","types","_Types","SystemEventType_Impl_"];
snow_types__$Types_SystemEventType_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "se_unknown";
	case 1:
		return "se_init";
	case 2:
		return "se_ready";
	case 3:
		return "se_tick";
	case 4:
		return "se_freeze";
	case 5:
		return "se_unfreeze";
	case 7:
		return "se_shutdown";
	case 8:
		return "se_window";
	case 9:
		return "se_input";
	case 10:
		return "se_quit";
	case 11:
		return "se_app_terminating";
	case 12:
		return "se_app_lowmemory";
	case 13:
		return "se_app_willenterbackground";
	case 14:
		return "se_app_didenterbackground";
	case 15:
		return "se_app_willenterforeground";
	case 16:
		return "se_app_didenterforeground";
	default:
		return "" + this1;
	}
};
var snow_types__$Types_WindowEventType_$Impl_$ = {};
$hxClasses["snow.types._Types.WindowEventType_Impl_"] = snow_types__$Types_WindowEventType_$Impl_$;
snow_types__$Types_WindowEventType_$Impl_$.__name__ = ["snow","types","_Types","WindowEventType_Impl_"];
snow_types__$Types_WindowEventType_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "we_unknown";
	case 1:
		return "we_shown";
	case 2:
		return "we_hidden";
	case 3:
		return "we_exposed";
	case 4:
		return "we_moved";
	case 5:
		return "we_resized";
	case 6:
		return "we_size_changed";
	case 7:
		return "we_minimized";
	case 8:
		return "we_maximized";
	case 9:
		return "we_restored";
	case 10:
		return "we_enter";
	case 11:
		return "we_leave";
	case 12:
		return "we_focus_gained";
	case 13:
		return "we_focus_lost";
	case 14:
		return "we_close";
	default:
		return "" + this1;
	}
};
var snow_types__$Types_InputEventType_$Impl_$ = {};
$hxClasses["snow.types._Types.InputEventType_Impl_"] = snow_types__$Types_InputEventType_$Impl_$;
snow_types__$Types_InputEventType_$Impl_$.__name__ = ["snow","types","_Types","InputEventType_Impl_"];
snow_types__$Types_InputEventType_$Impl_$.toString = function(this1) {
	switch(this1) {
	case 0:
		return "ie_unknown";
	case 1:
		return "ie_key";
	case 2:
		return "ie_text";
	case 3:
		return "ie_mouse";
	case 4:
		return "ie_touch";
	case 5:
		return "ie_gamepad";
	case 6:
		return "ie_joystick";
	default:
		return "" + this1;
	}
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
$hxClasses.Math = Math;
String.prototype.__class__ = $hxClasses.String = String;
String.__name__ = ["String"];
$hxClasses.Array = Array;
Array.__name__ = ["Array"];
Date.prototype.__class__ = $hxClasses.Date = Date;
Date.__name__ = ["Date"];
var Int = $hxClasses.Int = { __name__ : ["Int"]};
var Dynamic = $hxClasses.Dynamic = { __name__ : ["Dynamic"]};
var Float = $hxClasses.Float = Number;
Float.__name__ = ["Float"];
var Bool = $hxClasses.Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = $hxClasses.Class = { __name__ : ["Class"]};
var Enum = { };
if(Array.prototype.map == null) Array.prototype.map = function(f) {
	var a = [];
	var _g1 = 0;
	var _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = f(this[i]);
	}
	return a;
};
if(Array.prototype.filter == null) Array.prototype.filter = function(f1) {
	var a1 = [];
	var _g11 = 0;
	var _g2 = this.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		var e = this[i1];
		if(f1(e)) a1.push(e);
	}
	return a1;
};
var __map_reserved = {}
var ArrayBuffer = $global.ArrayBuffer || js_html_compat_ArrayBuffer;
if(ArrayBuffer.prototype.slice == null) ArrayBuffer.prototype.slice = js_html_compat_ArrayBuffer.sliceImpl;
var DataView = $global.DataView || js_html_compat_DataView;
var Uint8Array = $global.Uint8Array || js_html_compat_Uint8Array._new;
haxe_Serializer.USE_CACHE = false;
haxe_Serializer.USE_ENUM_INDEX = false;
haxe_Serializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe_Unserializer.DEFAULT_RESOLVER = Type;
haxe_Unserializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe_crypto_Base64.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
haxe_crypto_Base64.BYTES = haxe_io_Bytes.ofString(haxe_crypto_Base64.CHARS);
haxe_ds_ObjectMap.count = 0;
haxe_io_FPHelper.i64tmp = (function($this) {
	var $r;
	var x = new haxe__$Int64__$_$_$Int64(0,0);
	$r = x;
	return $r;
}(this));
js_Boot.__toStr = {}.toString;
js_html_compat_Uint8Array.BYTES_PER_ELEMENT = 1;
luxe_Tag.update = "update dt";
luxe_Tag.renderdt = "render dt";
luxe_Tag.game_update = "game.update";
luxe_Tag.render = "core.render";
luxe_Tag.debug = "core.debug";
luxe_Tag.updates = "core.updates";
luxe_Tag.events = "core.events";
luxe_Tag.audio = "core.audio";
luxe_Tag.input = "core.input";
luxe_Tag.timer = "core.timer";
luxe_Tag.scene = "core.scene";
luxe_Tag.debug_batch = "batcher.debug_batcher";
luxe_Debug.shut_down = false;
luxe_Log._level = 1;
luxe_Log._log_width = 16;
luxe_Physics.tag_physics = "physics";
luxe_debug_ProfilerDebugView.color_red = new phoenix_Color().rgb(13369344);
luxe_debug_ProfilerDebugView.color_green = new phoenix_Color().rgb(2263108);
luxe_debug_ProfilerDebugView.color_normal = new phoenix_Color().rgb(15790320);
luxe_macros_BuildVersion._save = false;
luxe_structural__$BalancedBST_NodeColor.red = true;
luxe_structural__$BalancedBST_NodeColor.black = false;
luxe_tween_actuators_SimpleActuator.actuators = [];
luxe_tween_actuators_SimpleActuator.actuatorsLength = 0;
luxe_tween_actuators_SimpleActuator.addedEvent = false;
luxe_tween_actuators_SimpleActuator.update_timer = 0;
luxe_tween_actuators_SimpleActuator.current_time = 0;
luxe_tween_Actuate.defaultActuator = luxe_tween_actuators_SimpleActuator;
luxe_tween_Actuate.defaultEase = luxe_tween_easing_Quad.get_easeOut();
luxe_tween_Actuate.targetLibraries = new haxe_ds_ObjectMap();
luxe_utils_GeometryUtils.two_pi = 6.283185307179586;
luxe_utils_Maths._PI_OVER_180 = 0.017453292519943278;
luxe_utils_Maths._180_OVER_PI = 57.29577951308238;
luxe_utils_unifill_Unicode.minCodePoint = 0;
luxe_utils_unifill_Unicode.maxCodePoint = 1114111;
luxe_utils_unifill_Unicode.minHighSurrogate = 55296;
luxe_utils_unifill_Unicode.maxHighSurrogate = 56319;
luxe_utils_unifill_Unicode.minLowSurrogate = 56320;
luxe_utils_unifill_Unicode.maxLowSurrogate = 57343;
phoenix_Batcher._sequence_key = -1;
phoenix_Batcher.vert_attribute = 0;
phoenix_Batcher.tcoord_attribute = 1;
phoenix_Batcher.color_attribute = 2;
phoenix_Batcher.normal_attribute = 3;
phoenix_Texture.default_filter = 9729;
phoenix_Texture.default_clamp = 33071;
phoenix_geometry_Geometry._sequence_key = -1;
phoenix_geometry_TextGeometry.tab_regex = new EReg("\t","gim");
snow_Snow.next_queue = [];
snow_Snow.defer_queue = [];
snow_api_Debug._level = 1;
snow_api_Debug._log_width = 16;
snow_api_Promises.calls = [];
snow_api_Promises.defers = [];
snow_api_Timer.running_timers = [];
snow_api_buffers__$Float32Array_Float32Array_$Impl_$.BYTES_PER_ELEMENT = 4;
snow_api_buffers__$Int32Array_Int32Array_$Impl_$.BYTES_PER_ELEMENT = 4;
snow_api_buffers__$Uint8Array_Uint8Array_$Impl_$.BYTES_PER_ELEMENT = 1;
snow_core_web_Runtime.web_window_id = 1;
snow_core_web_Runtime.timestamp_start = 0.0;
snow_core_web__$Runtime_DOMKeys.dom_shift = 16;
snow_core_web__$Runtime_DOMKeys.dom_ctrl = 17;
snow_core_web__$Runtime_DOMKeys.dom_alt = 18;
snow_core_web__$Runtime_DOMKeys.dom_capslock = 20;
snow_core_web__$Runtime_DOMKeys.dom_pageup = 33;
snow_core_web__$Runtime_DOMKeys.dom_pagedown = 34;
snow_core_web__$Runtime_DOMKeys.dom_end = 35;
snow_core_web__$Runtime_DOMKeys.dom_home = 36;
snow_core_web__$Runtime_DOMKeys.dom_left = 37;
snow_core_web__$Runtime_DOMKeys.dom_up = 38;
snow_core_web__$Runtime_DOMKeys.dom_right = 39;
snow_core_web__$Runtime_DOMKeys.dom_down = 40;
snow_core_web__$Runtime_DOMKeys.dom_printscr = 44;
snow_core_web__$Runtime_DOMKeys.dom_insert = 45;
snow_core_web__$Runtime_DOMKeys.dom_delete = 46;
snow_core_web__$Runtime_DOMKeys.dom_lmeta = 91;
snow_core_web__$Runtime_DOMKeys.dom_rmeta = 93;
snow_core_web__$Runtime_DOMKeys.dom_kp_0 = 96;
snow_core_web__$Runtime_DOMKeys.dom_kp_1 = 97;
snow_core_web__$Runtime_DOMKeys.dom_kp_2 = 98;
snow_core_web__$Runtime_DOMKeys.dom_kp_3 = 99;
snow_core_web__$Runtime_DOMKeys.dom_kp_4 = 100;
snow_core_web__$Runtime_DOMKeys.dom_kp_5 = 101;
snow_core_web__$Runtime_DOMKeys.dom_kp_6 = 102;
snow_core_web__$Runtime_DOMKeys.dom_kp_7 = 103;
snow_core_web__$Runtime_DOMKeys.dom_kp_8 = 104;
snow_core_web__$Runtime_DOMKeys.dom_kp_9 = 105;
snow_core_web__$Runtime_DOMKeys.dom_kp_multiply = 106;
snow_core_web__$Runtime_DOMKeys.dom_kp_plus = 107;
snow_core_web__$Runtime_DOMKeys.dom_kp_minus = 109;
snow_core_web__$Runtime_DOMKeys.dom_kp_decimal = 110;
snow_core_web__$Runtime_DOMKeys.dom_kp_divide = 111;
snow_core_web__$Runtime_DOMKeys.dom_kp_numlock = 144;
snow_core_web__$Runtime_DOMKeys.dom_f1 = 112;
snow_core_web__$Runtime_DOMKeys.dom_f2 = 113;
snow_core_web__$Runtime_DOMKeys.dom_f3 = 114;
snow_core_web__$Runtime_DOMKeys.dom_f4 = 115;
snow_core_web__$Runtime_DOMKeys.dom_f5 = 116;
snow_core_web__$Runtime_DOMKeys.dom_f6 = 117;
snow_core_web__$Runtime_DOMKeys.dom_f7 = 118;
snow_core_web__$Runtime_DOMKeys.dom_f8 = 119;
snow_core_web__$Runtime_DOMKeys.dom_f9 = 120;
snow_core_web__$Runtime_DOMKeys.dom_f10 = 121;
snow_core_web__$Runtime_DOMKeys.dom_f11 = 122;
snow_core_web__$Runtime_DOMKeys.dom_f12 = 123;
snow_core_web__$Runtime_DOMKeys.dom_f13 = 124;
snow_core_web__$Runtime_DOMKeys.dom_f14 = 125;
snow_core_web__$Runtime_DOMKeys.dom_f15 = 126;
snow_core_web__$Runtime_DOMKeys.dom_f16 = 127;
snow_core_web__$Runtime_DOMKeys.dom_f17 = 128;
snow_core_web__$Runtime_DOMKeys.dom_f18 = 129;
snow_core_web__$Runtime_DOMKeys.dom_f19 = 130;
snow_core_web__$Runtime_DOMKeys.dom_f20 = 131;
snow_core_web__$Runtime_DOMKeys.dom_f21 = 132;
snow_core_web__$Runtime_DOMKeys.dom_f22 = 133;
snow_core_web__$Runtime_DOMKeys.dom_f23 = 134;
snow_core_web__$Runtime_DOMKeys.dom_f24 = 135;
snow_core_web__$Runtime_DOMKeys.dom_caret = 160;
snow_core_web__$Runtime_DOMKeys.dom_exclaim = 161;
snow_core_web__$Runtime_DOMKeys.dom_quotedbl = 162;
snow_core_web__$Runtime_DOMKeys.dom_hash = 163;
snow_core_web__$Runtime_DOMKeys.dom_dollar = 164;
snow_core_web__$Runtime_DOMKeys.dom_percent = 165;
snow_core_web__$Runtime_DOMKeys.dom_ampersand = 166;
snow_core_web__$Runtime_DOMKeys.dom_underscore = 167;
snow_core_web__$Runtime_DOMKeys.dom_leftparen = 168;
snow_core_web__$Runtime_DOMKeys.dom_rightparen = 169;
snow_core_web__$Runtime_DOMKeys.dom_asterisk = 170;
snow_core_web__$Runtime_DOMKeys.dom_plus = 171;
snow_core_web__$Runtime_DOMKeys.dom_pipe = 172;
snow_core_web__$Runtime_DOMKeys.dom_minus = 173;
snow_core_web__$Runtime_DOMKeys.dom_leftbrace = 174;
snow_core_web__$Runtime_DOMKeys.dom_rightbrace = 175;
snow_core_web__$Runtime_DOMKeys.dom_tilde = 176;
snow_core_web__$Runtime_DOMKeys.dom_audiomute = 181;
snow_core_web__$Runtime_DOMKeys.dom_volumedown = 182;
snow_core_web__$Runtime_DOMKeys.dom_volumeup = 183;
snow_core_web__$Runtime_DOMKeys.dom_comma = 188;
snow_core_web__$Runtime_DOMKeys.dom_period = 190;
snow_core_web__$Runtime_DOMKeys.dom_slash = 191;
snow_core_web__$Runtime_DOMKeys.dom_backquote = 192;
snow_core_web__$Runtime_DOMKeys.dom_leftbracket = 219;
snow_core_web__$Runtime_DOMKeys.dom_rightbracket = 221;
snow_core_web__$Runtime_DOMKeys.dom_backslash = 220;
snow_core_web__$Runtime_DOMKeys.dom_quote = 222;
snow_core_web__$Runtime_DOMKeys.dom_meta = 224;
snow_core_web_assets_Assets.POT = true;
snow_modules_opengl_web_GL.DEPTH_BUFFER_BIT = 256;
snow_modules_opengl_web_GL.STENCIL_BUFFER_BIT = 1024;
snow_modules_opengl_web_GL.COLOR_BUFFER_BIT = 16384;
snow_modules_opengl_web_GL.POINTS = 0;
snow_modules_opengl_web_GL.LINES = 1;
snow_modules_opengl_web_GL.LINE_LOOP = 2;
snow_modules_opengl_web_GL.LINE_STRIP = 3;
snow_modules_opengl_web_GL.TRIANGLES = 4;
snow_modules_opengl_web_GL.TRIANGLE_STRIP = 5;
snow_modules_opengl_web_GL.TRIANGLE_FAN = 6;
snow_modules_opengl_web_GL.ZERO = 0;
snow_modules_opengl_web_GL.ONE = 1;
snow_modules_opengl_web_GL.SRC_COLOR = 768;
snow_modules_opengl_web_GL.ONE_MINUS_SRC_COLOR = 769;
snow_modules_opengl_web_GL.SRC_ALPHA = 770;
snow_modules_opengl_web_GL.ONE_MINUS_SRC_ALPHA = 771;
snow_modules_opengl_web_GL.DST_ALPHA = 772;
snow_modules_opengl_web_GL.ONE_MINUS_DST_ALPHA = 773;
snow_modules_opengl_web_GL.DST_COLOR = 774;
snow_modules_opengl_web_GL.ONE_MINUS_DST_COLOR = 775;
snow_modules_opengl_web_GL.SRC_ALPHA_SATURATE = 776;
snow_modules_opengl_web_GL.FUNC_ADD = 32774;
snow_modules_opengl_web_GL.BLEND_EQUATION = 32777;
snow_modules_opengl_web_GL.BLEND_EQUATION_RGB = 32777;
snow_modules_opengl_web_GL.BLEND_EQUATION_ALPHA = 34877;
snow_modules_opengl_web_GL.FUNC_SUBTRACT = 32778;
snow_modules_opengl_web_GL.FUNC_REVERSE_SUBTRACT = 32779;
snow_modules_opengl_web_GL.BLEND_DST_RGB = 32968;
snow_modules_opengl_web_GL.BLEND_SRC_RGB = 32969;
snow_modules_opengl_web_GL.BLEND_DST_ALPHA = 32970;
snow_modules_opengl_web_GL.BLEND_SRC_ALPHA = 32971;
snow_modules_opengl_web_GL.CONSTANT_COLOR = 32769;
snow_modules_opengl_web_GL.ONE_MINUS_CONSTANT_COLOR = 32770;
snow_modules_opengl_web_GL.CONSTANT_ALPHA = 32771;
snow_modules_opengl_web_GL.ONE_MINUS_CONSTANT_ALPHA = 32772;
snow_modules_opengl_web_GL.BLEND_COLOR = 32773;
snow_modules_opengl_web_GL.ARRAY_BUFFER = 34962;
snow_modules_opengl_web_GL.ELEMENT_ARRAY_BUFFER = 34963;
snow_modules_opengl_web_GL.ARRAY_BUFFER_BINDING = 34964;
snow_modules_opengl_web_GL.ELEMENT_ARRAY_BUFFER_BINDING = 34965;
snow_modules_opengl_web_GL.STREAM_DRAW = 35040;
snow_modules_opengl_web_GL.STATIC_DRAW = 35044;
snow_modules_opengl_web_GL.DYNAMIC_DRAW = 35048;
snow_modules_opengl_web_GL.BUFFER_SIZE = 34660;
snow_modules_opengl_web_GL.BUFFER_USAGE = 34661;
snow_modules_opengl_web_GL.CURRENT_VERTEX_ATTRIB = 34342;
snow_modules_opengl_web_GL.FRONT = 1028;
snow_modules_opengl_web_GL.BACK = 1029;
snow_modules_opengl_web_GL.FRONT_AND_BACK = 1032;
snow_modules_opengl_web_GL.CULL_FACE = 2884;
snow_modules_opengl_web_GL.BLEND = 3042;
snow_modules_opengl_web_GL.DITHER = 3024;
snow_modules_opengl_web_GL.STENCIL_TEST = 2960;
snow_modules_opengl_web_GL.DEPTH_TEST = 2929;
snow_modules_opengl_web_GL.SCISSOR_TEST = 3089;
snow_modules_opengl_web_GL.POLYGON_OFFSET_FILL = 32823;
snow_modules_opengl_web_GL.SAMPLE_ALPHA_TO_COVERAGE = 32926;
snow_modules_opengl_web_GL.SAMPLE_COVERAGE = 32928;
snow_modules_opengl_web_GL.NO_ERROR = 0;
snow_modules_opengl_web_GL.INVALID_ENUM = 1280;
snow_modules_opengl_web_GL.INVALID_VALUE = 1281;
snow_modules_opengl_web_GL.INVALID_OPERATION = 1282;
snow_modules_opengl_web_GL.OUT_OF_MEMORY = 1285;
snow_modules_opengl_web_GL.CW = 2304;
snow_modules_opengl_web_GL.CCW = 2305;
snow_modules_opengl_web_GL.LINE_WIDTH = 2849;
snow_modules_opengl_web_GL.ALIASED_POINT_SIZE_RANGE = 33901;
snow_modules_opengl_web_GL.ALIASED_LINE_WIDTH_RANGE = 33902;
snow_modules_opengl_web_GL.CULL_FACE_MODE = 2885;
snow_modules_opengl_web_GL.FRONT_FACE = 2886;
snow_modules_opengl_web_GL.DEPTH_RANGE = 2928;
snow_modules_opengl_web_GL.DEPTH_WRITEMASK = 2930;
snow_modules_opengl_web_GL.DEPTH_CLEAR_VALUE = 2931;
snow_modules_opengl_web_GL.DEPTH_FUNC = 2932;
snow_modules_opengl_web_GL.STENCIL_CLEAR_VALUE = 2961;
snow_modules_opengl_web_GL.STENCIL_FUNC = 2962;
snow_modules_opengl_web_GL.STENCIL_FAIL = 2964;
snow_modules_opengl_web_GL.STENCIL_PASS_DEPTH_FAIL = 2965;
snow_modules_opengl_web_GL.STENCIL_PASS_DEPTH_PASS = 2966;
snow_modules_opengl_web_GL.STENCIL_REF = 2967;
snow_modules_opengl_web_GL.STENCIL_VALUE_MASK = 2963;
snow_modules_opengl_web_GL.STENCIL_WRITEMASK = 2968;
snow_modules_opengl_web_GL.STENCIL_BACK_FUNC = 34816;
snow_modules_opengl_web_GL.STENCIL_BACK_FAIL = 34817;
snow_modules_opengl_web_GL.STENCIL_BACK_PASS_DEPTH_FAIL = 34818;
snow_modules_opengl_web_GL.STENCIL_BACK_PASS_DEPTH_PASS = 34819;
snow_modules_opengl_web_GL.STENCIL_BACK_REF = 36003;
snow_modules_opengl_web_GL.STENCIL_BACK_VALUE_MASK = 36004;
snow_modules_opengl_web_GL.STENCIL_BACK_WRITEMASK = 36005;
snow_modules_opengl_web_GL.VIEWPORT = 2978;
snow_modules_opengl_web_GL.SCISSOR_BOX = 3088;
snow_modules_opengl_web_GL.COLOR_CLEAR_VALUE = 3106;
snow_modules_opengl_web_GL.COLOR_WRITEMASK = 3107;
snow_modules_opengl_web_GL.UNPACK_ALIGNMENT = 3317;
snow_modules_opengl_web_GL.PACK_ALIGNMENT = 3333;
snow_modules_opengl_web_GL.MAX_TEXTURE_SIZE = 3379;
snow_modules_opengl_web_GL.MAX_VIEWPORT_DIMS = 3386;
snow_modules_opengl_web_GL.SUBPIXEL_BITS = 3408;
snow_modules_opengl_web_GL.RED_BITS = 3410;
snow_modules_opengl_web_GL.GREEN_BITS = 3411;
snow_modules_opengl_web_GL.BLUE_BITS = 3412;
snow_modules_opengl_web_GL.ALPHA_BITS = 3413;
snow_modules_opengl_web_GL.DEPTH_BITS = 3414;
snow_modules_opengl_web_GL.STENCIL_BITS = 3415;
snow_modules_opengl_web_GL.POLYGON_OFFSET_UNITS = 10752;
snow_modules_opengl_web_GL.POLYGON_OFFSET_FACTOR = 32824;
snow_modules_opengl_web_GL.TEXTURE_BINDING_2D = 32873;
snow_modules_opengl_web_GL.SAMPLE_BUFFERS = 32936;
snow_modules_opengl_web_GL.SAMPLES = 32937;
snow_modules_opengl_web_GL.SAMPLE_COVERAGE_VALUE = 32938;
snow_modules_opengl_web_GL.SAMPLE_COVERAGE_INVERT = 32939;
snow_modules_opengl_web_GL.COMPRESSED_TEXTURE_FORMATS = 34467;
snow_modules_opengl_web_GL.DONT_CARE = 4352;
snow_modules_opengl_web_GL.FASTEST = 4353;
snow_modules_opengl_web_GL.NICEST = 4354;
snow_modules_opengl_web_GL.GENERATE_MIPMAP_HINT = 33170;
snow_modules_opengl_web_GL.BYTE = 5120;
snow_modules_opengl_web_GL.UNSIGNED_BYTE = 5121;
snow_modules_opengl_web_GL.SHORT = 5122;
snow_modules_opengl_web_GL.UNSIGNED_SHORT = 5123;
snow_modules_opengl_web_GL.INT = 5124;
snow_modules_opengl_web_GL.UNSIGNED_INT = 5125;
snow_modules_opengl_web_GL.FLOAT = 5126;
snow_modules_opengl_web_GL.DEPTH_COMPONENT = 6402;
snow_modules_opengl_web_GL.ALPHA = 6406;
snow_modules_opengl_web_GL.RGB = 6407;
snow_modules_opengl_web_GL.RGBA = 6408;
snow_modules_opengl_web_GL.LUMINANCE = 6409;
snow_modules_opengl_web_GL.LUMINANCE_ALPHA = 6410;
snow_modules_opengl_web_GL.UNSIGNED_SHORT_4_4_4_4 = 32819;
snow_modules_opengl_web_GL.UNSIGNED_SHORT_5_5_5_1 = 32820;
snow_modules_opengl_web_GL.UNSIGNED_SHORT_5_6_5 = 33635;
snow_modules_opengl_web_GL.FRAGMENT_SHADER = 35632;
snow_modules_opengl_web_GL.VERTEX_SHADER = 35633;
snow_modules_opengl_web_GL.MAX_VERTEX_ATTRIBS = 34921;
snow_modules_opengl_web_GL.MAX_VERTEX_UNIFORM_VECTORS = 36347;
snow_modules_opengl_web_GL.MAX_VARYING_VECTORS = 36348;
snow_modules_opengl_web_GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661;
snow_modules_opengl_web_GL.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 35660;
snow_modules_opengl_web_GL.MAX_TEXTURE_IMAGE_UNITS = 34930;
snow_modules_opengl_web_GL.MAX_FRAGMENT_UNIFORM_VECTORS = 36349;
snow_modules_opengl_web_GL.SHADER_TYPE = 35663;
snow_modules_opengl_web_GL.DELETE_STATUS = 35712;
snow_modules_opengl_web_GL.LINK_STATUS = 35714;
snow_modules_opengl_web_GL.VALIDATE_STATUS = 35715;
snow_modules_opengl_web_GL.ATTACHED_SHADERS = 35717;
snow_modules_opengl_web_GL.ACTIVE_UNIFORMS = 35718;
snow_modules_opengl_web_GL.ACTIVE_ATTRIBUTES = 35721;
snow_modules_opengl_web_GL.SHADING_LANGUAGE_VERSION = 35724;
snow_modules_opengl_web_GL.CURRENT_PROGRAM = 35725;
snow_modules_opengl_web_GL.NEVER = 512;
snow_modules_opengl_web_GL.LESS = 513;
snow_modules_opengl_web_GL.EQUAL = 514;
snow_modules_opengl_web_GL.LEQUAL = 515;
snow_modules_opengl_web_GL.GREATER = 516;
snow_modules_opengl_web_GL.NOTEQUAL = 517;
snow_modules_opengl_web_GL.GEQUAL = 518;
snow_modules_opengl_web_GL.ALWAYS = 519;
snow_modules_opengl_web_GL.KEEP = 7680;
snow_modules_opengl_web_GL.REPLACE = 7681;
snow_modules_opengl_web_GL.INCR = 7682;
snow_modules_opengl_web_GL.DECR = 7683;
snow_modules_opengl_web_GL.INVERT = 5386;
snow_modules_opengl_web_GL.INCR_WRAP = 34055;
snow_modules_opengl_web_GL.DECR_WRAP = 34056;
snow_modules_opengl_web_GL.VENDOR = 7936;
snow_modules_opengl_web_GL.RENDERER = 7937;
snow_modules_opengl_web_GL.VERSION = 7938;
snow_modules_opengl_web_GL.NEAREST = 9728;
snow_modules_opengl_web_GL.LINEAR = 9729;
snow_modules_opengl_web_GL.NEAREST_MIPMAP_NEAREST = 9984;
snow_modules_opengl_web_GL.LINEAR_MIPMAP_NEAREST = 9985;
snow_modules_opengl_web_GL.NEAREST_MIPMAP_LINEAR = 9986;
snow_modules_opengl_web_GL.LINEAR_MIPMAP_LINEAR = 9987;
snow_modules_opengl_web_GL.TEXTURE_MAG_FILTER = 10240;
snow_modules_opengl_web_GL.TEXTURE_MIN_FILTER = 10241;
snow_modules_opengl_web_GL.TEXTURE_WRAP_S = 10242;
snow_modules_opengl_web_GL.TEXTURE_WRAP_T = 10243;
snow_modules_opengl_web_GL.TEXTURE_2D = 3553;
snow_modules_opengl_web_GL.TEXTURE = 5890;
snow_modules_opengl_web_GL.TEXTURE_CUBE_MAP = 34067;
snow_modules_opengl_web_GL.TEXTURE_BINDING_CUBE_MAP = 34068;
snow_modules_opengl_web_GL.TEXTURE_CUBE_MAP_POSITIVE_X = 34069;
snow_modules_opengl_web_GL.TEXTURE_CUBE_MAP_NEGATIVE_X = 34070;
snow_modules_opengl_web_GL.TEXTURE_CUBE_MAP_POSITIVE_Y = 34071;
snow_modules_opengl_web_GL.TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072;
snow_modules_opengl_web_GL.TEXTURE_CUBE_MAP_POSITIVE_Z = 34073;
snow_modules_opengl_web_GL.TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074;
snow_modules_opengl_web_GL.MAX_CUBE_MAP_TEXTURE_SIZE = 34076;
snow_modules_opengl_web_GL.TEXTURE0 = 33984;
snow_modules_opengl_web_GL.TEXTURE1 = 33985;
snow_modules_opengl_web_GL.TEXTURE2 = 33986;
snow_modules_opengl_web_GL.TEXTURE3 = 33987;
snow_modules_opengl_web_GL.TEXTURE4 = 33988;
snow_modules_opengl_web_GL.TEXTURE5 = 33989;
snow_modules_opengl_web_GL.TEXTURE6 = 33990;
snow_modules_opengl_web_GL.TEXTURE7 = 33991;
snow_modules_opengl_web_GL.TEXTURE8 = 33992;
snow_modules_opengl_web_GL.TEXTURE9 = 33993;
snow_modules_opengl_web_GL.TEXTURE10 = 33994;
snow_modules_opengl_web_GL.TEXTURE11 = 33995;
snow_modules_opengl_web_GL.TEXTURE12 = 33996;
snow_modules_opengl_web_GL.TEXTURE13 = 33997;
snow_modules_opengl_web_GL.TEXTURE14 = 33998;
snow_modules_opengl_web_GL.TEXTURE15 = 33999;
snow_modules_opengl_web_GL.TEXTURE16 = 34000;
snow_modules_opengl_web_GL.TEXTURE17 = 34001;
snow_modules_opengl_web_GL.TEXTURE18 = 34002;
snow_modules_opengl_web_GL.TEXTURE19 = 34003;
snow_modules_opengl_web_GL.TEXTURE20 = 34004;
snow_modules_opengl_web_GL.TEXTURE21 = 34005;
snow_modules_opengl_web_GL.TEXTURE22 = 34006;
snow_modules_opengl_web_GL.TEXTURE23 = 34007;
snow_modules_opengl_web_GL.TEXTURE24 = 34008;
snow_modules_opengl_web_GL.TEXTURE25 = 34009;
snow_modules_opengl_web_GL.TEXTURE26 = 34010;
snow_modules_opengl_web_GL.TEXTURE27 = 34011;
snow_modules_opengl_web_GL.TEXTURE28 = 34012;
snow_modules_opengl_web_GL.TEXTURE29 = 34013;
snow_modules_opengl_web_GL.TEXTURE30 = 34014;
snow_modules_opengl_web_GL.TEXTURE31 = 34015;
snow_modules_opengl_web_GL.ACTIVE_TEXTURE = 34016;
snow_modules_opengl_web_GL.REPEAT = 10497;
snow_modules_opengl_web_GL.CLAMP_TO_EDGE = 33071;
snow_modules_opengl_web_GL.MIRRORED_REPEAT = 33648;
snow_modules_opengl_web_GL.FLOAT_VEC2 = 35664;
snow_modules_opengl_web_GL.FLOAT_VEC3 = 35665;
snow_modules_opengl_web_GL.FLOAT_VEC4 = 35666;
snow_modules_opengl_web_GL.INT_VEC2 = 35667;
snow_modules_opengl_web_GL.INT_VEC3 = 35668;
snow_modules_opengl_web_GL.INT_VEC4 = 35669;
snow_modules_opengl_web_GL.BOOL = 35670;
snow_modules_opengl_web_GL.BOOL_VEC2 = 35671;
snow_modules_opengl_web_GL.BOOL_VEC3 = 35672;
snow_modules_opengl_web_GL.BOOL_VEC4 = 35673;
snow_modules_opengl_web_GL.FLOAT_MAT2 = 35674;
snow_modules_opengl_web_GL.FLOAT_MAT3 = 35675;
snow_modules_opengl_web_GL.FLOAT_MAT4 = 35676;
snow_modules_opengl_web_GL.SAMPLER_2D = 35678;
snow_modules_opengl_web_GL.SAMPLER_CUBE = 35680;
snow_modules_opengl_web_GL.VERTEX_ATTRIB_ARRAY_ENABLED = 34338;
snow_modules_opengl_web_GL.VERTEX_ATTRIB_ARRAY_SIZE = 34339;
snow_modules_opengl_web_GL.VERTEX_ATTRIB_ARRAY_STRIDE = 34340;
snow_modules_opengl_web_GL.VERTEX_ATTRIB_ARRAY_TYPE = 34341;
snow_modules_opengl_web_GL.VERTEX_ATTRIB_ARRAY_NORMALIZED = 34922;
snow_modules_opengl_web_GL.VERTEX_ATTRIB_ARRAY_POINTER = 34373;
snow_modules_opengl_web_GL.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 34975;
snow_modules_opengl_web_GL.VERTEX_PROGRAM_POINT_SIZE = 34370;
snow_modules_opengl_web_GL.POINT_SPRITE = 34913;
snow_modules_opengl_web_GL.COMPILE_STATUS = 35713;
snow_modules_opengl_web_GL.LOW_FLOAT = 36336;
snow_modules_opengl_web_GL.MEDIUM_FLOAT = 36337;
snow_modules_opengl_web_GL.HIGH_FLOAT = 36338;
snow_modules_opengl_web_GL.LOW_INT = 36339;
snow_modules_opengl_web_GL.MEDIUM_INT = 36340;
snow_modules_opengl_web_GL.HIGH_INT = 36341;
snow_modules_opengl_web_GL.FRAMEBUFFER = 36160;
snow_modules_opengl_web_GL.RENDERBUFFER = 36161;
snow_modules_opengl_web_GL.RGBA4 = 32854;
snow_modules_opengl_web_GL.RGB5_A1 = 32855;
snow_modules_opengl_web_GL.RGB565 = 36194;
snow_modules_opengl_web_GL.DEPTH_COMPONENT16 = 33189;
snow_modules_opengl_web_GL.STENCIL_INDEX = 6401;
snow_modules_opengl_web_GL.STENCIL_INDEX8 = 36168;
snow_modules_opengl_web_GL.DEPTH_STENCIL = 34041;
snow_modules_opengl_web_GL.RENDERBUFFER_WIDTH = 36162;
snow_modules_opengl_web_GL.RENDERBUFFER_HEIGHT = 36163;
snow_modules_opengl_web_GL.RENDERBUFFER_INTERNAL_FORMAT = 36164;
snow_modules_opengl_web_GL.RENDERBUFFER_RED_SIZE = 36176;
snow_modules_opengl_web_GL.RENDERBUFFER_GREEN_SIZE = 36177;
snow_modules_opengl_web_GL.RENDERBUFFER_BLUE_SIZE = 36178;
snow_modules_opengl_web_GL.RENDERBUFFER_ALPHA_SIZE = 36179;
snow_modules_opengl_web_GL.RENDERBUFFER_DEPTH_SIZE = 36180;
snow_modules_opengl_web_GL.RENDERBUFFER_STENCIL_SIZE = 36181;
snow_modules_opengl_web_GL.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 36048;
snow_modules_opengl_web_GL.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 36049;
snow_modules_opengl_web_GL.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 36050;
snow_modules_opengl_web_GL.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 36051;
snow_modules_opengl_web_GL.COLOR_ATTACHMENT0 = 36064;
snow_modules_opengl_web_GL.DEPTH_ATTACHMENT = 36096;
snow_modules_opengl_web_GL.STENCIL_ATTACHMENT = 36128;
snow_modules_opengl_web_GL.DEPTH_STENCIL_ATTACHMENT = 33306;
snow_modules_opengl_web_GL.NONE = 0;
snow_modules_opengl_web_GL.FRAMEBUFFER_COMPLETE = 36053;
snow_modules_opengl_web_GL.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 36054;
snow_modules_opengl_web_GL.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 36055;
snow_modules_opengl_web_GL.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 36057;
snow_modules_opengl_web_GL.FRAMEBUFFER_UNSUPPORTED = 36061;
snow_modules_opengl_web_GL.FRAMEBUFFER_BINDING = 36006;
snow_modules_opengl_web_GL.RENDERBUFFER_BINDING = 36007;
snow_modules_opengl_web_GL.MAX_RENDERBUFFER_SIZE = 34024;
snow_modules_opengl_web_GL.INVALID_FRAMEBUFFER_OPERATION = 1286;
snow_modules_opengl_web_GL.UNPACK_FLIP_Y_WEBGL = 37440;
snow_modules_opengl_web_GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 37441;
snow_modules_opengl_web_GL.CONTEXT_LOST_WEBGL = 37442;
snow_modules_opengl_web_GL.UNPACK_COLORSPACE_CONVERSION_WEBGL = 37443;
snow_modules_opengl_web_GL.BROWSER_DEFAULT_WEBGL = 37444;
snow_modules_webaudio_Audio.half_pi = 1.5707;
snow_systems_input_Scancodes.MASK = 1073741824;
snow_systems_input_Scancodes.unknown = 0;
snow_systems_input_Scancodes.key_a = 4;
snow_systems_input_Scancodes.key_b = 5;
snow_systems_input_Scancodes.key_c = 6;
snow_systems_input_Scancodes.key_d = 7;
snow_systems_input_Scancodes.key_e = 8;
snow_systems_input_Scancodes.key_f = 9;
snow_systems_input_Scancodes.key_g = 10;
snow_systems_input_Scancodes.key_h = 11;
snow_systems_input_Scancodes.key_i = 12;
snow_systems_input_Scancodes.key_j = 13;
snow_systems_input_Scancodes.key_k = 14;
snow_systems_input_Scancodes.key_l = 15;
snow_systems_input_Scancodes.key_m = 16;
snow_systems_input_Scancodes.key_n = 17;
snow_systems_input_Scancodes.key_o = 18;
snow_systems_input_Scancodes.key_p = 19;
snow_systems_input_Scancodes.key_q = 20;
snow_systems_input_Scancodes.key_r = 21;
snow_systems_input_Scancodes.key_s = 22;
snow_systems_input_Scancodes.key_t = 23;
snow_systems_input_Scancodes.key_u = 24;
snow_systems_input_Scancodes.key_v = 25;
snow_systems_input_Scancodes.key_w = 26;
snow_systems_input_Scancodes.key_x = 27;
snow_systems_input_Scancodes.key_y = 28;
snow_systems_input_Scancodes.key_z = 29;
snow_systems_input_Scancodes.key_1 = 30;
snow_systems_input_Scancodes.key_2 = 31;
snow_systems_input_Scancodes.key_3 = 32;
snow_systems_input_Scancodes.key_4 = 33;
snow_systems_input_Scancodes.key_5 = 34;
snow_systems_input_Scancodes.key_6 = 35;
snow_systems_input_Scancodes.key_7 = 36;
snow_systems_input_Scancodes.key_8 = 37;
snow_systems_input_Scancodes.key_9 = 38;
snow_systems_input_Scancodes.key_0 = 39;
snow_systems_input_Scancodes.enter = 40;
snow_systems_input_Scancodes.escape = 41;
snow_systems_input_Scancodes.backspace = 42;
snow_systems_input_Scancodes.tab = 43;
snow_systems_input_Scancodes.space = 44;
snow_systems_input_Scancodes.minus = 45;
snow_systems_input_Scancodes.equals = 46;
snow_systems_input_Scancodes.leftbracket = 47;
snow_systems_input_Scancodes.rightbracket = 48;
snow_systems_input_Scancodes.backslash = 49;
snow_systems_input_Scancodes.nonushash = 50;
snow_systems_input_Scancodes.semicolon = 51;
snow_systems_input_Scancodes.apostrophe = 52;
snow_systems_input_Scancodes.grave = 53;
snow_systems_input_Scancodes.comma = 54;
snow_systems_input_Scancodes.period = 55;
snow_systems_input_Scancodes.slash = 56;
snow_systems_input_Scancodes.capslock = 57;
snow_systems_input_Scancodes.f1 = 58;
snow_systems_input_Scancodes.f2 = 59;
snow_systems_input_Scancodes.f3 = 60;
snow_systems_input_Scancodes.f4 = 61;
snow_systems_input_Scancodes.f5 = 62;
snow_systems_input_Scancodes.f6 = 63;
snow_systems_input_Scancodes.f7 = 64;
snow_systems_input_Scancodes.f8 = 65;
snow_systems_input_Scancodes.f9 = 66;
snow_systems_input_Scancodes.f10 = 67;
snow_systems_input_Scancodes.f11 = 68;
snow_systems_input_Scancodes.f12 = 69;
snow_systems_input_Scancodes.printscreen = 70;
snow_systems_input_Scancodes.scrolllock = 71;
snow_systems_input_Scancodes.pause = 72;
snow_systems_input_Scancodes.insert = 73;
snow_systems_input_Scancodes.home = 74;
snow_systems_input_Scancodes.pageup = 75;
snow_systems_input_Scancodes["delete"] = 76;
snow_systems_input_Scancodes.end = 77;
snow_systems_input_Scancodes.pagedown = 78;
snow_systems_input_Scancodes.right = 79;
snow_systems_input_Scancodes.left = 80;
snow_systems_input_Scancodes.down = 81;
snow_systems_input_Scancodes.up = 82;
snow_systems_input_Scancodes.numlockclear = 83;
snow_systems_input_Scancodes.kp_divide = 84;
snow_systems_input_Scancodes.kp_multiply = 85;
snow_systems_input_Scancodes.kp_minus = 86;
snow_systems_input_Scancodes.kp_plus = 87;
snow_systems_input_Scancodes.kp_enter = 88;
snow_systems_input_Scancodes.kp_1 = 89;
snow_systems_input_Scancodes.kp_2 = 90;
snow_systems_input_Scancodes.kp_3 = 91;
snow_systems_input_Scancodes.kp_4 = 92;
snow_systems_input_Scancodes.kp_5 = 93;
snow_systems_input_Scancodes.kp_6 = 94;
snow_systems_input_Scancodes.kp_7 = 95;
snow_systems_input_Scancodes.kp_8 = 96;
snow_systems_input_Scancodes.kp_9 = 97;
snow_systems_input_Scancodes.kp_0 = 98;
snow_systems_input_Scancodes.kp_period = 99;
snow_systems_input_Scancodes.nonusbackslash = 100;
snow_systems_input_Scancodes.application = 101;
snow_systems_input_Scancodes.power = 102;
snow_systems_input_Scancodes.kp_equals = 103;
snow_systems_input_Scancodes.f13 = 104;
snow_systems_input_Scancodes.f14 = 105;
snow_systems_input_Scancodes.f15 = 106;
snow_systems_input_Scancodes.f16 = 107;
snow_systems_input_Scancodes.f17 = 108;
snow_systems_input_Scancodes.f18 = 109;
snow_systems_input_Scancodes.f19 = 110;
snow_systems_input_Scancodes.f20 = 111;
snow_systems_input_Scancodes.f21 = 112;
snow_systems_input_Scancodes.f22 = 113;
snow_systems_input_Scancodes.f23 = 114;
snow_systems_input_Scancodes.f24 = 115;
snow_systems_input_Scancodes.execute = 116;
snow_systems_input_Scancodes.help = 117;
snow_systems_input_Scancodes.menu = 118;
snow_systems_input_Scancodes.select = 119;
snow_systems_input_Scancodes.stop = 120;
snow_systems_input_Scancodes.again = 121;
snow_systems_input_Scancodes.undo = 122;
snow_systems_input_Scancodes.cut = 123;
snow_systems_input_Scancodes.copy = 124;
snow_systems_input_Scancodes.paste = 125;
snow_systems_input_Scancodes.find = 126;
snow_systems_input_Scancodes.mute = 127;
snow_systems_input_Scancodes.volumeup = 128;
snow_systems_input_Scancodes.volumedown = 129;
snow_systems_input_Scancodes.kp_comma = 133;
snow_systems_input_Scancodes.kp_equalsas400 = 134;
snow_systems_input_Scancodes.international1 = 135;
snow_systems_input_Scancodes.international2 = 136;
snow_systems_input_Scancodes.international3 = 137;
snow_systems_input_Scancodes.international4 = 138;
snow_systems_input_Scancodes.international5 = 139;
snow_systems_input_Scancodes.international6 = 140;
snow_systems_input_Scancodes.international7 = 141;
snow_systems_input_Scancodes.international8 = 142;
snow_systems_input_Scancodes.international9 = 143;
snow_systems_input_Scancodes.lang1 = 144;
snow_systems_input_Scancodes.lang2 = 145;
snow_systems_input_Scancodes.lang3 = 146;
snow_systems_input_Scancodes.lang4 = 147;
snow_systems_input_Scancodes.lang5 = 148;
snow_systems_input_Scancodes.lang6 = 149;
snow_systems_input_Scancodes.lang7 = 150;
snow_systems_input_Scancodes.lang8 = 151;
snow_systems_input_Scancodes.lang9 = 152;
snow_systems_input_Scancodes.alterase = 153;
snow_systems_input_Scancodes.sysreq = 154;
snow_systems_input_Scancodes.cancel = 155;
snow_systems_input_Scancodes.clear = 156;
snow_systems_input_Scancodes.prior = 157;
snow_systems_input_Scancodes.return2 = 158;
snow_systems_input_Scancodes.separator = 159;
snow_systems_input_Scancodes.out = 160;
snow_systems_input_Scancodes.oper = 161;
snow_systems_input_Scancodes.clearagain = 162;
snow_systems_input_Scancodes.crsel = 163;
snow_systems_input_Scancodes.exsel = 164;
snow_systems_input_Scancodes.kp_00 = 176;
snow_systems_input_Scancodes.kp_000 = 177;
snow_systems_input_Scancodes.thousandsseparator = 178;
snow_systems_input_Scancodes.decimalseparator = 179;
snow_systems_input_Scancodes.currencyunit = 180;
snow_systems_input_Scancodes.currencysubunit = 181;
snow_systems_input_Scancodes.kp_leftparen = 182;
snow_systems_input_Scancodes.kp_rightparen = 183;
snow_systems_input_Scancodes.kp_leftbrace = 184;
snow_systems_input_Scancodes.kp_rightbrace = 185;
snow_systems_input_Scancodes.kp_tab = 186;
snow_systems_input_Scancodes.kp_backspace = 187;
snow_systems_input_Scancodes.kp_a = 188;
snow_systems_input_Scancodes.kp_b = 189;
snow_systems_input_Scancodes.kp_c = 190;
snow_systems_input_Scancodes.kp_d = 191;
snow_systems_input_Scancodes.kp_e = 192;
snow_systems_input_Scancodes.kp_f = 193;
snow_systems_input_Scancodes.kp_xor = 194;
snow_systems_input_Scancodes.kp_power = 195;
snow_systems_input_Scancodes.kp_percent = 196;
snow_systems_input_Scancodes.kp_less = 197;
snow_systems_input_Scancodes.kp_greater = 198;
snow_systems_input_Scancodes.kp_ampersand = 199;
snow_systems_input_Scancodes.kp_dblampersand = 200;
snow_systems_input_Scancodes.kp_verticalbar = 201;
snow_systems_input_Scancodes.kp_dblverticalbar = 202;
snow_systems_input_Scancodes.kp_colon = 203;
snow_systems_input_Scancodes.kp_hash = 204;
snow_systems_input_Scancodes.kp_space = 205;
snow_systems_input_Scancodes.kp_at = 206;
snow_systems_input_Scancodes.kp_exclam = 207;
snow_systems_input_Scancodes.kp_memstore = 208;
snow_systems_input_Scancodes.kp_memrecall = 209;
snow_systems_input_Scancodes.kp_memclear = 210;
snow_systems_input_Scancodes.kp_memadd = 211;
snow_systems_input_Scancodes.kp_memsubtract = 212;
snow_systems_input_Scancodes.kp_memmultiply = 213;
snow_systems_input_Scancodes.kp_memdivide = 214;
snow_systems_input_Scancodes.kp_plusminus = 215;
snow_systems_input_Scancodes.kp_clear = 216;
snow_systems_input_Scancodes.kp_clearentry = 217;
snow_systems_input_Scancodes.kp_binary = 218;
snow_systems_input_Scancodes.kp_octal = 219;
snow_systems_input_Scancodes.kp_decimal = 220;
snow_systems_input_Scancodes.kp_hexadecimal = 221;
snow_systems_input_Scancodes.lctrl = 224;
snow_systems_input_Scancodes.lshift = 225;
snow_systems_input_Scancodes.lalt = 226;
snow_systems_input_Scancodes.lmeta = 227;
snow_systems_input_Scancodes.rctrl = 228;
snow_systems_input_Scancodes.rshift = 229;
snow_systems_input_Scancodes.ralt = 230;
snow_systems_input_Scancodes.rmeta = 231;
snow_systems_input_Scancodes.mode = 257;
snow_systems_input_Scancodes.audionext = 258;
snow_systems_input_Scancodes.audioprev = 259;
snow_systems_input_Scancodes.audiostop = 260;
snow_systems_input_Scancodes.audioplay = 261;
snow_systems_input_Scancodes.audiomute = 262;
snow_systems_input_Scancodes.mediaselect = 263;
snow_systems_input_Scancodes.www = 264;
snow_systems_input_Scancodes.mail = 265;
snow_systems_input_Scancodes.calculator = 266;
snow_systems_input_Scancodes.computer = 267;
snow_systems_input_Scancodes.ac_search = 268;
snow_systems_input_Scancodes.ac_home = 269;
snow_systems_input_Scancodes.ac_back = 270;
snow_systems_input_Scancodes.ac_forward = 271;
snow_systems_input_Scancodes.ac_stop = 272;
snow_systems_input_Scancodes.ac_refresh = 273;
snow_systems_input_Scancodes.ac_bookmarks = 274;
snow_systems_input_Scancodes.brightnessdown = 275;
snow_systems_input_Scancodes.brightnessup = 276;
snow_systems_input_Scancodes.displayswitch = 277;
snow_systems_input_Scancodes.kbdillumtoggle = 278;
snow_systems_input_Scancodes.kbdillumdown = 279;
snow_systems_input_Scancodes.kbdillumup = 280;
snow_systems_input_Scancodes.eject = 281;
snow_systems_input_Scancodes.sleep = 282;
snow_systems_input_Scancodes.app1 = 283;
snow_systems_input_Scancodes.app2 = 284;
snow_systems_input_Scancodes.scancode_names = [null,null,null,null,"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","1","2","3","4","5","6","7","8","9","0","Enter","Escape","Backspace","Tab","Space","-","=","[","]","\\","#",";","'","`",",",".","/","CapsLock","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","PrintScreen","ScrollLock","Pause","Insert","Home","PageUp","Delete","End","PageDown","Right","Left","Down","Up","Numlock","Keypad /","Keypad *","Keypad -","Keypad +","Keypad Enter","Keypad 1","Keypad 2","Keypad 3","Keypad 4","Keypad 5","Keypad 6","Keypad 7","Keypad 8","Keypad 9","Keypad 0","Keypad .",null,"Application","Power","Keypad =","F13","F14","F15","F16","F17","F18","F19","F20","F21","F22","F23","F24","Execute","Help","Menu","Select","Stop","Again","Undo","Cut","Copy","Paste","Find","Mute","VolumeUp","VolumeDown",null,null,null,"Keypad ,","Keypad = (AS400)",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"AltErase","SysReq","Cancel","Clear","Prior","Enter","Separator","Out","Oper","Clear / Again","CrSel","ExSel",null,null,null,null,null,null,null,null,null,null,null,"Keypad 00","Keypad 000","ThousandsSeparator","DecimalSeparator","CurrencyUnit","CurrencySubUnit","Keypad (","Keypad )","Keypad {","Keypad }","Keypad Tab","Keypad Backspace","Keypad A","Keypad B","Keypad C","Keypad D","Keypad E","Keypad F","Keypad XOR","Keypad ^","Keypad %","Keypad <","Keypad >","Keypad &","Keypad &&","Keypad |","Keypad ||","Keypad :","Keypad #","Keypad Space","Keypad @","Keypad !","Keypad MemStore","Keypad MemRecall","Keypad MemClear","Keypad MemAdd","Keypad MemSubtract","Keypad MemMultiply","Keypad MemDivide","Keypad +/-","Keypad Clear","Keypad ClearEntry","Keypad Binary","Keypad Octal","Keypad Decimal","Keypad Hexadecimal",null,null,"Left Ctrl","Left Shift","Left Alt","Left Meta","Right Ctrl","Right Shift","Right Alt","Right Meta",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"ModeSwitch","AudioNext","AudioPrev","AudioStop","AudioPlay","AudioMute","MediaSelect","WWW","Mail","Calculator","Computer","AC Search","AC Home","AC Back","AC Forward","AC Stop","AC Refresh","AC Bookmarks","BrightnessDown","BrightnessUp","DisplaySwitch","KBDIllumToggle","KBDIllumDown","KBDIllumUp","Eject","Sleep"];
snow_systems_input_Keycodes.unknown = 0;
snow_systems_input_Keycodes.enter = 13;
snow_systems_input_Keycodes.escape = 27;
snow_systems_input_Keycodes.backspace = 8;
snow_systems_input_Keycodes.tab = 9;
snow_systems_input_Keycodes.space = 32;
snow_systems_input_Keycodes.exclaim = 33;
snow_systems_input_Keycodes.quotedbl = 34;
snow_systems_input_Keycodes.hash = 35;
snow_systems_input_Keycodes.percent = 37;
snow_systems_input_Keycodes.dollar = 36;
snow_systems_input_Keycodes.ampersand = 38;
snow_systems_input_Keycodes.quote = 39;
snow_systems_input_Keycodes.leftparen = 40;
snow_systems_input_Keycodes.rightparen = 41;
snow_systems_input_Keycodes.asterisk = 42;
snow_systems_input_Keycodes.plus = 43;
snow_systems_input_Keycodes.comma = 44;
snow_systems_input_Keycodes.minus = 45;
snow_systems_input_Keycodes.period = 46;
snow_systems_input_Keycodes.slash = 47;
snow_systems_input_Keycodes.key_0 = 48;
snow_systems_input_Keycodes.key_1 = 49;
snow_systems_input_Keycodes.key_2 = 50;
snow_systems_input_Keycodes.key_3 = 51;
snow_systems_input_Keycodes.key_4 = 52;
snow_systems_input_Keycodes.key_5 = 53;
snow_systems_input_Keycodes.key_6 = 54;
snow_systems_input_Keycodes.key_7 = 55;
snow_systems_input_Keycodes.key_8 = 56;
snow_systems_input_Keycodes.key_9 = 57;
snow_systems_input_Keycodes.colon = 58;
snow_systems_input_Keycodes.semicolon = 59;
snow_systems_input_Keycodes.less = 60;
snow_systems_input_Keycodes.equals = 61;
snow_systems_input_Keycodes.greater = 62;
snow_systems_input_Keycodes.question = 63;
snow_systems_input_Keycodes.at = 64;
snow_systems_input_Keycodes.leftbracket = 91;
snow_systems_input_Keycodes.backslash = 92;
snow_systems_input_Keycodes.rightbracket = 93;
snow_systems_input_Keycodes.caret = 94;
snow_systems_input_Keycodes.underscore = 95;
snow_systems_input_Keycodes.backquote = 96;
snow_systems_input_Keycodes.key_a = 97;
snow_systems_input_Keycodes.key_b = 98;
snow_systems_input_Keycodes.key_c = 99;
snow_systems_input_Keycodes.key_d = 100;
snow_systems_input_Keycodes.key_e = 101;
snow_systems_input_Keycodes.key_f = 102;
snow_systems_input_Keycodes.key_g = 103;
snow_systems_input_Keycodes.key_h = 104;
snow_systems_input_Keycodes.key_i = 105;
snow_systems_input_Keycodes.key_j = 106;
snow_systems_input_Keycodes.key_k = 107;
snow_systems_input_Keycodes.key_l = 108;
snow_systems_input_Keycodes.key_m = 109;
snow_systems_input_Keycodes.key_n = 110;
snow_systems_input_Keycodes.key_o = 111;
snow_systems_input_Keycodes.key_p = 112;
snow_systems_input_Keycodes.key_q = 113;
snow_systems_input_Keycodes.key_r = 114;
snow_systems_input_Keycodes.key_s = 115;
snow_systems_input_Keycodes.key_t = 116;
snow_systems_input_Keycodes.key_u = 117;
snow_systems_input_Keycodes.key_v = 118;
snow_systems_input_Keycodes.key_w = 119;
snow_systems_input_Keycodes.key_x = 120;
snow_systems_input_Keycodes.key_y = 121;
snow_systems_input_Keycodes.key_z = 122;
snow_systems_input_Keycodes.capslock = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.capslock);
snow_systems_input_Keycodes.f1 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f1);
snow_systems_input_Keycodes.f2 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f2);
snow_systems_input_Keycodes.f3 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f3);
snow_systems_input_Keycodes.f4 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f4);
snow_systems_input_Keycodes.f5 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f5);
snow_systems_input_Keycodes.f6 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f6);
snow_systems_input_Keycodes.f7 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f7);
snow_systems_input_Keycodes.f8 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f8);
snow_systems_input_Keycodes.f9 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f9);
snow_systems_input_Keycodes.f10 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f10);
snow_systems_input_Keycodes.f11 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f11);
snow_systems_input_Keycodes.f12 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f12);
snow_systems_input_Keycodes.printscreen = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.printscreen);
snow_systems_input_Keycodes.scrolllock = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.scrolllock);
snow_systems_input_Keycodes.pause = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.pause);
snow_systems_input_Keycodes.insert = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.insert);
snow_systems_input_Keycodes.home = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.home);
snow_systems_input_Keycodes.pageup = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.pageup);
snow_systems_input_Keycodes["delete"] = 127;
snow_systems_input_Keycodes.end = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.end);
snow_systems_input_Keycodes.pagedown = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.pagedown);
snow_systems_input_Keycodes.right = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.right);
snow_systems_input_Keycodes.left = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.left);
snow_systems_input_Keycodes.down = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.down);
snow_systems_input_Keycodes.up = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.up);
snow_systems_input_Keycodes.numlockclear = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.numlockclear);
snow_systems_input_Keycodes.kp_divide = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_divide);
snow_systems_input_Keycodes.kp_multiply = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_multiply);
snow_systems_input_Keycodes.kp_minus = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_minus);
snow_systems_input_Keycodes.kp_plus = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_plus);
snow_systems_input_Keycodes.kp_enter = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_enter);
snow_systems_input_Keycodes.kp_1 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_1);
snow_systems_input_Keycodes.kp_2 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_2);
snow_systems_input_Keycodes.kp_3 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_3);
snow_systems_input_Keycodes.kp_4 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_4);
snow_systems_input_Keycodes.kp_5 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_5);
snow_systems_input_Keycodes.kp_6 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_6);
snow_systems_input_Keycodes.kp_7 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_7);
snow_systems_input_Keycodes.kp_8 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_8);
snow_systems_input_Keycodes.kp_9 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_9);
snow_systems_input_Keycodes.kp_0 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_0);
snow_systems_input_Keycodes.kp_period = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_period);
snow_systems_input_Keycodes.application = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.application);
snow_systems_input_Keycodes.power = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.power);
snow_systems_input_Keycodes.kp_equals = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_equals);
snow_systems_input_Keycodes.f13 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f13);
snow_systems_input_Keycodes.f14 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f14);
snow_systems_input_Keycodes.f15 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f15);
snow_systems_input_Keycodes.f16 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f16);
snow_systems_input_Keycodes.f17 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f17);
snow_systems_input_Keycodes.f18 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f18);
snow_systems_input_Keycodes.f19 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f19);
snow_systems_input_Keycodes.f20 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f20);
snow_systems_input_Keycodes.f21 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f21);
snow_systems_input_Keycodes.f22 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f22);
snow_systems_input_Keycodes.f23 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f23);
snow_systems_input_Keycodes.f24 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.f24);
snow_systems_input_Keycodes.execute = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.execute);
snow_systems_input_Keycodes.help = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.help);
snow_systems_input_Keycodes.menu = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.menu);
snow_systems_input_Keycodes.select = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.select);
snow_systems_input_Keycodes.stop = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.stop);
snow_systems_input_Keycodes.again = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.again);
snow_systems_input_Keycodes.undo = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.undo);
snow_systems_input_Keycodes.cut = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.cut);
snow_systems_input_Keycodes.copy = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.copy);
snow_systems_input_Keycodes.paste = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.paste);
snow_systems_input_Keycodes.find = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.find);
snow_systems_input_Keycodes.mute = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.mute);
snow_systems_input_Keycodes.volumeup = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.volumeup);
snow_systems_input_Keycodes.volumedown = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.volumedown);
snow_systems_input_Keycodes.kp_comma = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_comma);
snow_systems_input_Keycodes.kp_equalsas400 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_equalsas400);
snow_systems_input_Keycodes.alterase = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.alterase);
snow_systems_input_Keycodes.sysreq = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.sysreq);
snow_systems_input_Keycodes.cancel = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.cancel);
snow_systems_input_Keycodes.clear = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.clear);
snow_systems_input_Keycodes.prior = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.prior);
snow_systems_input_Keycodes.return2 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.return2);
snow_systems_input_Keycodes.separator = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.separator);
snow_systems_input_Keycodes.out = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.out);
snow_systems_input_Keycodes.oper = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.oper);
snow_systems_input_Keycodes.clearagain = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.clearagain);
snow_systems_input_Keycodes.crsel = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.crsel);
snow_systems_input_Keycodes.exsel = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.exsel);
snow_systems_input_Keycodes.kp_00 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_00);
snow_systems_input_Keycodes.kp_000 = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_000);
snow_systems_input_Keycodes.thousandsseparator = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.thousandsseparator);
snow_systems_input_Keycodes.decimalseparator = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.decimalseparator);
snow_systems_input_Keycodes.currencyunit = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.currencyunit);
snow_systems_input_Keycodes.currencysubunit = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.currencysubunit);
snow_systems_input_Keycodes.kp_leftparen = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_leftparen);
snow_systems_input_Keycodes.kp_rightparen = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_rightparen);
snow_systems_input_Keycodes.kp_leftbrace = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_leftbrace);
snow_systems_input_Keycodes.kp_rightbrace = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_rightbrace);
snow_systems_input_Keycodes.kp_tab = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_tab);
snow_systems_input_Keycodes.kp_backspace = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_backspace);
snow_systems_input_Keycodes.kp_a = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_a);
snow_systems_input_Keycodes.kp_b = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_b);
snow_systems_input_Keycodes.kp_c = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_c);
snow_systems_input_Keycodes.kp_d = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_d);
snow_systems_input_Keycodes.kp_e = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_e);
snow_systems_input_Keycodes.kp_f = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_f);
snow_systems_input_Keycodes.kp_xor = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_xor);
snow_systems_input_Keycodes.kp_power = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_power);
snow_systems_input_Keycodes.kp_percent = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_percent);
snow_systems_input_Keycodes.kp_less = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_less);
snow_systems_input_Keycodes.kp_greater = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_greater);
snow_systems_input_Keycodes.kp_ampersand = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_ampersand);
snow_systems_input_Keycodes.kp_dblampersand = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_dblampersand);
snow_systems_input_Keycodes.kp_verticalbar = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_verticalbar);
snow_systems_input_Keycodes.kp_dblverticalbar = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_dblverticalbar);
snow_systems_input_Keycodes.kp_colon = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_colon);
snow_systems_input_Keycodes.kp_hash = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_hash);
snow_systems_input_Keycodes.kp_space = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_space);
snow_systems_input_Keycodes.kp_at = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_at);
snow_systems_input_Keycodes.kp_exclam = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_exclam);
snow_systems_input_Keycodes.kp_memstore = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_memstore);
snow_systems_input_Keycodes.kp_memrecall = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_memrecall);
snow_systems_input_Keycodes.kp_memclear = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_memclear);
snow_systems_input_Keycodes.kp_memadd = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_memadd);
snow_systems_input_Keycodes.kp_memsubtract = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_memsubtract);
snow_systems_input_Keycodes.kp_memmultiply = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_memmultiply);
snow_systems_input_Keycodes.kp_memdivide = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_memdivide);
snow_systems_input_Keycodes.kp_plusminus = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_plusminus);
snow_systems_input_Keycodes.kp_clear = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_clear);
snow_systems_input_Keycodes.kp_clearentry = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_clearentry);
snow_systems_input_Keycodes.kp_binary = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_binary);
snow_systems_input_Keycodes.kp_octal = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_octal);
snow_systems_input_Keycodes.kp_decimal = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_decimal);
snow_systems_input_Keycodes.kp_hexadecimal = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kp_hexadecimal);
snow_systems_input_Keycodes.lctrl = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.lctrl);
snow_systems_input_Keycodes.lshift = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.lshift);
snow_systems_input_Keycodes.lalt = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.lalt);
snow_systems_input_Keycodes.lmeta = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.lmeta);
snow_systems_input_Keycodes.rctrl = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.rctrl);
snow_systems_input_Keycodes.rshift = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.rshift);
snow_systems_input_Keycodes.ralt = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.ralt);
snow_systems_input_Keycodes.rmeta = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.rmeta);
snow_systems_input_Keycodes.mode = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.mode);
snow_systems_input_Keycodes.audionext = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.audionext);
snow_systems_input_Keycodes.audioprev = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.audioprev);
snow_systems_input_Keycodes.audiostop = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.audiostop);
snow_systems_input_Keycodes.audioplay = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.audioplay);
snow_systems_input_Keycodes.audiomute = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.audiomute);
snow_systems_input_Keycodes.mediaselect = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.mediaselect);
snow_systems_input_Keycodes.www = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.www);
snow_systems_input_Keycodes.mail = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.mail);
snow_systems_input_Keycodes.calculator = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.calculator);
snow_systems_input_Keycodes.computer = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.computer);
snow_systems_input_Keycodes.ac_search = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.ac_search);
snow_systems_input_Keycodes.ac_home = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.ac_home);
snow_systems_input_Keycodes.ac_back = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.ac_back);
snow_systems_input_Keycodes.ac_forward = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.ac_forward);
snow_systems_input_Keycodes.ac_stop = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.ac_stop);
snow_systems_input_Keycodes.ac_refresh = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.ac_refresh);
snow_systems_input_Keycodes.ac_bookmarks = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.ac_bookmarks);
snow_systems_input_Keycodes.brightnessdown = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.brightnessdown);
snow_systems_input_Keycodes.brightnessup = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.brightnessup);
snow_systems_input_Keycodes.displayswitch = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.displayswitch);
snow_systems_input_Keycodes.kbdillumtoggle = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kbdillumtoggle);
snow_systems_input_Keycodes.kbdillumdown = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kbdillumdown);
snow_systems_input_Keycodes.kbdillumup = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.kbdillumup);
snow_systems_input_Keycodes.eject = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.eject);
snow_systems_input_Keycodes.sleep = snow_systems_input_Keycodes.from_scan(snow_systems_input_Scancodes.sleep);
snow_types_Config.app_runtime = "snow.core.web.Runtime";
snow_types_Config.app_config = "config.json";
snow_types_Config.app_ident = "com.foolmoron.SlimySquad";
snow_types_Config.app_main = "luxe.Core";
snow_types_Config.module_assets = "snow.core.web.assets.Assets";
snow_types_Config.module_audio = "snow.modules.webaudio.Audio";
snow_types_Config.module_io = "snow.core.web.io.IO";
snow_types_Config.extensions = [];
snow_types__$Types_AssetType_$Impl_$.at_unknown = 0;
snow_types__$Types_AssetType_$Impl_$.at_bytes = 1;
snow_types__$Types_AssetType_$Impl_$.at_text = 2;
snow_types__$Types_AssetType_$Impl_$.at_json = 3;
snow_types__$Types_AssetType_$Impl_$.at_image = 4;
snow_types__$Types_AssetType_$Impl_$.at_audio = 5;
snow_types__$Types_AudioFormatType_$Impl_$.af_unknown = 0;
snow_types__$Types_AudioFormatType_$Impl_$.af_custom = 1;
snow_types__$Types_AudioFormatType_$Impl_$.af_ogg = 2;
snow_types__$Types_AudioFormatType_$Impl_$.af_wav = 3;
snow_types__$Types_AudioFormatType_$Impl_$.af_pcm = 4;
snow_types__$Types_AudioEvent_$Impl_$.ae_end = 0;
snow_types__$Types_AudioEvent_$Impl_$.ae_destroyed = 1;
snow_types__$Types_AudioEvent_$Impl_$.ae_destroyed_source = 2;
snow_types__$Types_AudioState_$Impl_$.as_invalid = -1;
snow_types__$Types_AudioState_$Impl_$.as_paused = 0;
snow_types__$Types_AudioState_$Impl_$.as_playing = 1;
snow_types__$Types_AudioState_$Impl_$.as_stopped = 2;
snow_types__$Types_OpenGLProfile_$Impl_$.compatibility = 0;
snow_types__$Types_OpenGLProfile_$Impl_$.core = 1;
snow_types__$Types_OpenGLProfile_$Impl_$.gles = 2;
snow_types__$Types_KeyEventType_$Impl_$.ke_unknown = 0;
snow_types__$Types_KeyEventType_$Impl_$.ke_down = 1;
snow_types__$Types_KeyEventType_$Impl_$.ke_up = 2;
snow_types__$Types_MouseEventType_$Impl_$.me_unknown = 0;
snow_types__$Types_MouseEventType_$Impl_$.me_move = 1;
snow_types__$Types_MouseEventType_$Impl_$.me_down = 2;
snow_types__$Types_MouseEventType_$Impl_$.me_up = 3;
snow_types__$Types_MouseEventType_$Impl_$.me_wheel = 4;
snow_types__$Types_TouchEventType_$Impl_$.te_unknown = 0;
snow_types__$Types_TouchEventType_$Impl_$.te_move = 1;
snow_types__$Types_TouchEventType_$Impl_$.te_down = 2;
snow_types__$Types_TouchEventType_$Impl_$.te_up = 3;
snow_types__$Types_GamepadEventType_$Impl_$.ge_unknown = 0;
snow_types__$Types_GamepadEventType_$Impl_$.ge_axis = 1;
snow_types__$Types_GamepadEventType_$Impl_$.ge_down = 2;
snow_types__$Types_GamepadEventType_$Impl_$.ge_up = 3;
snow_types__$Types_GamepadEventType_$Impl_$.ge_device = 4;
snow_types__$Types_TextEventType_$Impl_$.te_unknown = 0;
snow_types__$Types_TextEventType_$Impl_$.te_edit = 1;
snow_types__$Types_TextEventType_$Impl_$.te_input = 2;
snow_types__$Types_GamepadDeviceEventType_$Impl_$.ge_unknown = 0;
snow_types__$Types_GamepadDeviceEventType_$Impl_$.ge_device_added = 1;
snow_types__$Types_GamepadDeviceEventType_$Impl_$.ge_device_removed = 2;
snow_types__$Types_GamepadDeviceEventType_$Impl_$.ge_device_remapped = 3;
snow_types__$Types_SystemEventType_$Impl_$.se_unknown = 0;
snow_types__$Types_SystemEventType_$Impl_$.se_init = 1;
snow_types__$Types_SystemEventType_$Impl_$.se_ready = 2;
snow_types__$Types_SystemEventType_$Impl_$.se_tick = 3;
snow_types__$Types_SystemEventType_$Impl_$.se_freeze = 4;
snow_types__$Types_SystemEventType_$Impl_$.se_unfreeze = 5;
snow_types__$Types_SystemEventType_$Impl_$.se_suspend = 6;
snow_types__$Types_SystemEventType_$Impl_$.se_shutdown = 7;
snow_types__$Types_SystemEventType_$Impl_$.se_window = 8;
snow_types__$Types_SystemEventType_$Impl_$.se_input = 9;
snow_types__$Types_SystemEventType_$Impl_$.se_quit = 10;
snow_types__$Types_SystemEventType_$Impl_$.se_app_terminating = 11;
snow_types__$Types_SystemEventType_$Impl_$.se_app_lowmemory = 12;
snow_types__$Types_SystemEventType_$Impl_$.se_app_willenterbackground = 13;
snow_types__$Types_SystemEventType_$Impl_$.se_app_didenterbackground = 14;
snow_types__$Types_SystemEventType_$Impl_$.se_app_willenterforeground = 15;
snow_types__$Types_SystemEventType_$Impl_$.se_app_didenterforeground = 16;
snow_types__$Types_WindowEventType_$Impl_$.we_unknown = 0;
snow_types__$Types_WindowEventType_$Impl_$.we_shown = 1;
snow_types__$Types_WindowEventType_$Impl_$.we_hidden = 2;
snow_types__$Types_WindowEventType_$Impl_$.we_exposed = 3;
snow_types__$Types_WindowEventType_$Impl_$.we_moved = 4;
snow_types__$Types_WindowEventType_$Impl_$.we_resized = 5;
snow_types__$Types_WindowEventType_$Impl_$.we_size_changed = 6;
snow_types__$Types_WindowEventType_$Impl_$.we_minimized = 7;
snow_types__$Types_WindowEventType_$Impl_$.we_maximized = 8;
snow_types__$Types_WindowEventType_$Impl_$.we_restored = 9;
snow_types__$Types_WindowEventType_$Impl_$.we_enter = 10;
snow_types__$Types_WindowEventType_$Impl_$.we_leave = 11;
snow_types__$Types_WindowEventType_$Impl_$.we_focus_gained = 12;
snow_types__$Types_WindowEventType_$Impl_$.we_focus_lost = 13;
snow_types__$Types_WindowEventType_$Impl_$.we_close = 14;
snow_types__$Types_InputEventType_$Impl_$.ie_unknown = 0;
snow_types__$Types_InputEventType_$Impl_$.ie_key = 1;
snow_types__$Types_InputEventType_$Impl_$.ie_text = 2;
snow_types__$Types_InputEventType_$Impl_$.ie_mouse = 3;
snow_types__$Types_InputEventType_$Impl_$.ie_touch = 4;
snow_types__$Types_InputEventType_$Impl_$.ie_gamepad = 5;
snow_types__$Types_InputEventType_$Impl_$.ie_joystick = 6;
LuxeApp.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);