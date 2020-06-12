(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.AnnounceKit = {}));
}(this, (function (exports) { 'use strict';

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script = {
    name: "AnnounceKit",
    props: {
      name: String,
      widget: {
        type: String,
        required: true,
      },
      catchClick: String,
      widgetStyle: Object,

      floatWidget: Boolean,
      embedWidget: Boolean,

      onWidgetOpen: Function,
      onWidgetClose: Function,
      onWidgetResize: Function,
      onWidgetUnread: Function,

      user: Object,
      data: Object,
      lang: String,
    },
    methods: {
      loaded: function() {
        var style = this.$props.widgetStyle;

        var styleParams = {
          badge: {
            style: style,
          },
          line: {
            style: style,
          },
          float: {
            style: style,
          },
        };

        if (this.$props.floatWidget) {
          delete styleParams.badge;
          delete styleParams.line;
          this.selector = null;
        }

        this.widgetName = Math.random()
          .toString(36)
          .substring(10);

        var _this = this;

        var options = Object.assign({}, styleParams, {
          widget: this.$props.widget,
          name: this.widgetName,
          version: 2,
          framework: "vue",
          framework_version: "2.0.0",
          selector: this.selector,
          embed: this.$props.embedWidget,
          onInit: function(_widget) {
            if (_widget.conf.name !== _this.widgetName) {
              return _widget.destroy();
            }

            var ann = window["announcekit"];

            _this.widgetInstance = _widget;

            if (_this.$props.catchClick) {
              var elem = document.querySelector(_this.$props.catchClick);
              if (elem)
                { elem.addEventListener("click", function() {
                  _widget.open();
                }); }
            }

            ann.on("widget-open", function(ref) {
              if (ref.widget === _widget && _this.$props.onWidgetOpen) {
                _this.$props.onWidgetOpen({ widget: ref.widget });
              }
            });

            ann.on("widget-close", function(ref) {
              if (ref.widget === _widget && _this.$props.onWidgetClose) {
                _this.$props.onWidgetClose({ widget: ref.widget });
              }
            });

            ann.on("widget-resize", function(ref) {
              if (ref.widget === _widget && _this.$props.onWidgetResize) {
                _this.$props.onWidgetResize({
                  widget: ref.widget,
                  size: ref.size,
                });
              }
            });

            ann.on("widget-unread", function(ref) {
              if (ref.widget === _widget && _this.$props.onWidgetUnread) {
                _this.$props.onWidgetUnread({
                  widget: ref.widget,
                  unread: ref.unread,
                });
              }
            });
          },
          data: this.$props.data,
          user: this.$props.user,
          lang: this.$props.lang,
        });

        window["announcekit"].push(options);
      },
    },

    created: function() {
      this.widgetInstance = null;

      var widgetName =
        this.$props.name ||
        Math.random()
          .toString(36)
          .substring(10);

      this.selector = ".ak-" + widgetName;
    },
    updated: function() {
      this.$nextTick(function() {
        if (this.widgetInstance) {
          this.widgetInstance.destroy();
          this.loaded();
        }
      });
    },
    mounted: function() {
      this.$nextTick(function() {
        if (!window["announcekit"]) {
          window["announcekit"] = window["announcekit"] || {
            queue: [],
            push: function(x) {
              window["announcekit"].queue.push(x);
            },
            on: function(n, x) {
              window["announcekit"].queue.push([n, x]);
            },
          };

          var scripttag = document.createElement("script");
          scripttag["async"] = true;
          scripttag["src"] = "https://cdn.announcekit.app/widget-v2.js";

          var scr = document.getElementsByTagName("script")[0];
          scr.parentNode.insertBefore(scripttag, scr);
        }

        this.loaded();
      });
    },
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      var options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      var hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              var originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              var existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  /* script */
  var __vue_script__ = script;

  /* template */
  var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("a", {
      class: [_vm.selector ? _vm.selector.slice(1) : ""],
      attrs: {
        user: [_vm.user ? _vm.user : null],
        data: [_vm.data ? _vm.data : null],
        lang: [_vm.lang ? _vm.lang : null],
        href: "#"
      }
    })
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    var __vue_inject_styles__ = undefined;
    /* scoped */
    var __vue_scope_id__ = undefined;
    /* module identifier */
    var __vue_module_identifier__ = undefined;
    /* functional template */
    var __vue_is_functional_template__ = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    var __vue_component__ = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      undefined,
      undefined,
      undefined
    );

  // Declare install function executed by Vue.use()
  function install(Vue) {
    if (install.installed) { return; }
    install.installed = true;
    Vue.component("AnnounceKit", __vue_component__);
  }

  // Create module definition for Vue.use()
  var plugin = {
    install: install
  };

  // Auto-install when vue is found (eg. in browser via <script> tag)
  var GlobalVue = null;
  if (typeof window !== "undefined") {
    GlobalVue = window.Vue;
  } else if (typeof global !== "undefined") {
    GlobalVue = global.Vue;
  }
  if (GlobalVue) {
    GlobalVue.use(plugin);
  }

  exports.default = __vue_component__;
  exports.install = install;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
