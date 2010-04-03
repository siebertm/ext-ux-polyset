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
        addButtons: [{
          text: "new1",
          addValue: 42
        }, {
          text: 'new2',
          addValue: 'bar'
        }],
        removeButtonConfig: {
          text: "go away"
        },
        addInitialPanels: true,
        headerPanel: {
          html: "<h1>Header</h1>"
        },
        contentPanel: function(i) {
          return {
            layout: "form",
            autoHeight: true,
            items: [{
              fieldLabel: "Data " + i,
              xtype: "textfield",
              value: "Wert " + i,
              name: ("data_" + i)
            }],
            getValue: function() {
              return { data: this.items.get(0).getValue() };
            },
            setValue: function() {
            }
          };
        },
        value: [1, 2, 3, 4]
      }, {
           xtype: 'fieldset',
            title: 'Individual Checkboxes',
            autoHeight: true,
            defaultType: 'checkbox', // each item will be a checkbox
            items: [{
                xtype: 'textfield',
                name: 'txt-test1',
                fieldLabel: 'Alignment Test'
            }, {
                fieldLabel: 'Favorite Animals',
                // boxLabel: 'Dog',
                name: 'fav-animal-dog'
            }, {
                fieldLabel: '',
                labelSeparator: '',
                boxLabel: 'Cat',
                name: 'fav-animal-cat'
            }, {
                checked: true,
                fieldLabel: '',
                labelSeparator: '',
                boxLabel: 'Monkey',
                name: 'fav-animal-monkey'
            }]
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
