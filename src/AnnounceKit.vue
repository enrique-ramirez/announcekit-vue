<template>
  <div
    style="display: inline"
    ref="elementRef"
    v-bind:user="[user ? user : null]"
    v-bind:data="[data ? data : null]"
    v-bind:lang="[lang ? lang : null]"
    href="#"
  ></div>
</template>

<script>
export default {
  name: "AnnounceKit",
  data() {
    return {
      widgetHandlers: [],
    };
  },
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
    boosters: {
      type: Boolean,
      default: true,
    },
    user: Object,
    data: Object,
    lang: String,
  },
  watch: {
    data: function (val) {
      if (!this.isString(val)) {
        this.loaded();
      }
    },
    user: function (val) {
      if (!this.isString(val)) {
        this.loaded();
      }
    },
    widgetStyle: function (val) {
      this.loaded();
    },
    embedWidget: function (val) {
      this.loaded();
    },
    floatWidget: function (val) {
      this.loaded();
    },
    lang: function (val) {
      this.loaded();
    },
    boosters: function (val) {
      this.loaded();
    },
  },
  methods: {
    loaded: function () {
      const style = this.$props.widgetStyle;

      const styleParams = {
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
      }

      this.widgetName = Math.random().toString(36).substring(10);

      const _this = this;
      const options = Object.assign({}, styleParams, {
        widget: this.$props.widget,
        name: this.widgetName,
        version: 2,
        framework: "vue",
        framework_version: "2.0.0",
        selector: _this.elementRef,
        embed: this.$props.embedWidget,
        onInit: function (_widget) {
          if (_widget.conf.name !== _this.widgetName) {
            return _widget.destroy();
          }

          const ann = window["announcekit"];

          _this.widgetInstance = _widget;

          _this.widgetHandlers.forEach((h) => h(_widget));
          _this.widgetHandlers = [];

          if (_this.$props.catchClick) {
            const elem = document.querySelector(_this.$props.catchClick);
            if (elem)
              elem.addEventListener("click", function () {
                _widget.open();
              });
          }

          ann.on("widget-open", function (ref) {
            if (ref.widget === _widget && _this.$props.onWidgetOpen) {
              _this.$props.onWidgetOpen({ widget: ref.widget });
            }
          });

          ann.on("widget-close", function (ref) {
            if (ref.widget === _widget && _this.$props.onWidgetClose) {
              _this.$props.onWidgetClose({ widget: ref.widget });
            }
          });

          ann.on("widget-resize", function (ref) {
            if (ref.widget === _widget && _this.$props.onWidgetResize) {
              _this.$props.onWidgetResize({
                widget: ref.widget,
                size: ref.size,
              });
            }
          });

          if (_this.$props.onWidgetUnread) {
            _this.$props.onWidgetUnread({
              widget: _widget,
              unread: _widget.state.ui.unreadCount,
            });
          }
        },
        data: _this.$props.data,
        user: _this.$props.user,
        lang: _this.$props.lang,
        boosters: _this.$props.boosters,
      });

      window["announcekit"].push(options);
    },
    open: function () {
      this.withWidget((widget) => widget.open());
    },
    close: function () {
      this.withWidget((widget) => widget.close());
    },
    unread: function () {
      return this.withWidget((widget) => widget.state.ui.unreadCount);
    },
    instance: function () {
      return this.withWidget((widget) => widget);
    },
    withWidget: function (fn) {
      return new Promise((res) => {
        if (this.widgetInstance) {
          return res(fn(this.widgetInstance));
        } else {
          this.widgetHandlers.push((widget) => {
            res(fn(widget));
          });
        }
      });
    },
    isString: function (obj) {
      return obj !== undefined && obj !== null && obj.constructor === String;
    },
  },
  created: function () {
    this.widgetInstance = null;
  },
  updated: function() {
    this.$nextTick(function() {
      if (this.widgetInstance) {
        this.widgetInstance.destroy();
        this.loaded();
      }
    });
  },
  mounted: function () {
    this.$nextTick(function () {
      if (!window["announcekit"]) {
        window["announcekit"] = window["announcekit"] || {
          queue: [],
          push: function (x) {
            window["announcekit"].queue.push(x);
          },
          on: function (n, x) {
            window["announcekit"].queue.push([n, x]);
          },
        };

        var scripttag = document.createElement("script");
        scripttag["async"] = true;
        scripttag["src"] = `https://cdn.announcekit.app/widget-v2.js`;

        var scr = document.getElementsByTagName("script")[0];
        scr.parentNode.insertBefore(scripttag, scr);
      }
      this.elementRef = this.$refs.elementRef;
      this.loaded();
    });
  },
};
</script>