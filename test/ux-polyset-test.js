Ext.onReady(function() {
  var i = 0;

  var win = new Ext.Window({
    title: "PolySet Example",
    width: 500,
    height: 400,
    border: false,
    layout: "fit",
    items: [{
      frame: true,
      border: false,
      xtype: "form",
      items: [{
        xtype: "ux-polyset",
        addButtonConfig: {
          text: "new"
        },
        removeButtonConfig: {
          text: "go away"
        },
        contentPanel: function() {
          ++i;
          return {
            layout: "form",
            items: [{
              fieldLabel: "Data " + i,
              xtype: "textfield",
              name: ("data_" + i)
            }],
            getValue: function() {
              return { data: this.items.get(0).getValue() };
            }
          };
        }
      }],
      buttons: [{
        text: "get value",
        handler: function() {
          alert(Ext.encode(win.items.get(0).items.get(0).getValue()));
        }
      }, {
        text: "reset",
        handler: function() {
        }
      }]
    }]
  });

  win.show(null, function() {
    win.center();
  });
});
