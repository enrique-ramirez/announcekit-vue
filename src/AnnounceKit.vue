<template>
  <a
    v-bind:user="[user ? user : null]"
    v-bind:data="[data ? data : null]"
    v-bind:lang="[lang ? lang : null]"
    v-bind:class="[selector ? selector.slice(1) : '']"
    href="#"
  ></a>
</template>

<script>
export default {
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
        this.selector = null;
      }

      this.widgetName = Math.random()
        .toString(36)
        .substring(10);

      const _this = this;

      const options = Object.assign({}, styleParams, {
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

          const ann = window["announcekit"];

          _this.widgetInstance = _widget;

          if (_this.$props.catchClick) {
            const elem = document.querySelector(_this.$props.catchClick);
            if (elem)
              elem.addEventListener("click", function() {
                _widget.open();
              });
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

          if (_this.$props.onWidgetUnread) {
            _this.$props.onWidgetUnread({widget:_widget, unread:_widget.state.ui.unreadCount});
          }
          
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

    const widgetName =
      this.$props.name ||
      Math.random()
        .toString(36)
        .substring(10);

    this.selector = `.ak-${widgetName}`;
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
        scripttag["src"] = `https://cdn.announcekit.app/widget-v2.js`;

        var scr = document.getElementsByTagName("script")[0];
        scr.parentNode.insertBefore(scripttag, scr);
      }

      this.loaded();
    });
  },
};
</script>
