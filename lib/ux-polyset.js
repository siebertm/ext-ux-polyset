
Ext.namespace("Ext.ux");

Ext.ux.PolySet = Ext.extend(Ext.form.Field, {
  /**
   * {Object|Function} a config object to create sub panels. when giving a function,
   * it gets passed the value when called
   *
   * this config option MUST be set
   */
  contentPanel: undefined,

  /**
   * {Object} a Panel configuration object to create a header panel which is rendered as
   * the first panel
   */
  headerPanel: undefined,

  /**
   * {Array} an initial  which is passed to setValue().
   */
  value: undefined,

  /**
   * {Object} a config object to be mixed into the add button config.
   * can be used to customize the look'n'feel of the button
   */
  addButtonConfig: {
    text: "add"
  },

  /**
   * {Object} a config object to be mixed into the remove button config.
   * can be used to customize the look'n'feel of the button
   */
  removeButtonConfig: {
    text: "remove"
  },

  /**
   * {Number} the width of the rightmost column (which contains the add / delete buttons)
   */
  buttonColumnWidth: 75,

  /**
   * {Boolean|Number} false to not add any initial panels, true to add one, a
   * number to add so many initial panels (fires the before/after paneladd events)
   * ignored when the value contig option is given
   */
  addInitialPanels: false,

  /**
   * {Boolean} true to set the readOnly option to all rows and hide the add/remove buttons.
   * defaults to false
   */
  readOnly: false,

  // hideLabel: true,
  inputType: "hidden",


  initComponent: function() {
    if (!this.contentPanel) {
      throw "contentPanel config option must be set!";
    }

    this.addEvents({
      /**
       * fired before adding another panel (e.q. the "add" button was clicked)
       *
       * return false to prevent adding
       *
       * @param {Ext.ux.PolySet} pnl this panel
       */
      "beforeaddpanel": true,

      /**
       * firef before removing a panel (e.g. the "remove" button wsa clicked)
       *
       * return false to prevent removal
       *
       * @param {Ext.ux.PolySet} pnl this panel
       * @param {Ext.Panel} pnl2 the panel that would be removed
       */
      "beforeremovepanel": true,

      /**
       * fired after adding another panel
       * @param {Ext.ux.PolySet} pnl this panel
       * @param {Ext.Panel} pnl2 the added panel
       */
      "afteraddpanel": true,


      /**
       * fired after removin a panel
       * @param {Ext.ux.PolySet} pnl this panel
       */
      "afterremovepanel": true
    });

    this.subPanels = new Ext.util.MixedCollection();

    Ext.ux.PolySet.superclass.initComponent.call(this, {});
  },

  /**
   * returns a collection of all sub-panels
   *
   * @returns {Ext.util.MixedCollection} a collection of all current sub-panels
   */
  getSubPanels: function() {
    return this.subPanels;
  },

  /**
   * returns an array of all the sub-panel's values
   *
   * the values are retrieved by calling the panel's getValue methods
   *
   * @return Array
   */
  getValue: function() {
    var values = [];

    this.getSubPanels().each(function(item) {
      values.push(item.getValue());
    }, this);

    return values;
  },

  /**
   * sets the value of this panel.
   *
   * creates all neccessary sub-panels from the values
   *
   * @param {Array} v the values to set
   */
  setValue: function(values) {
    this.removeAllPanels();

    Ext.each(values, function(value) {
      this.addPanel(value);
    }, this);
  },

  /**
   * adds another panel
   *
   * fires the beforeaddpanel event which would prevent the addition
   * of the new panel
   *
   * @param {Mixed} value an optional value to pass into the contentPanel call
   * @returns {Boolean} true if the panel was added, false otherwise
   */
  addPanel: function(value) {
    if (this.fireEvent("beforeaddpanel", this) === false) {
      return false;
    }

    var pnl = this.panel.insert(this.panel.items.getCount() - 1, this._getRow(this._getContentPanel(value)));
    this.subPanels.add(pnl.id, pnl);
    pnl.setValue(value);

    this._updateItems();

    this.panel.doLayout();
    this.fireEvent("afteraddpanel", this, pnl);

    return true;
  },

  /**
   * removes a panel
   *
   * fires the beforeremovepanel event which could prevent removal
   *
   * @param {Ext.Panel} pnl the panel to remove
   * @returns {Boolean} true if the panel was moreved, false otherwise
   */
  removePanel: function(pnl) {
    if (this.fireEvent("beforeremovepanel", this, pnl) === false) {
      return false;
    }

    this.subPanels.removeKey(pnl.id);
    this.panel.remove(pnl);
    this.panel.doLayout();
    this._updateItems();
    this.fireEvent("afterremovepanel", this);

    return true;
  },

  /**
   * removes all panels
   *
   * does not fire the removepanel events
   */
  removeAllPanels: function() {
    this.getSubPanels().each(function(pnl) {
      this.panel.remove(pnl);
    }, this);
    this.panel.doLayout();
    this.subPanels.clear();
    this._updateItems();
  },



  /*=====================================*/
  /* Private members */

  _updateItems: function() {
    var fields = this.panel.findBy(function(c){
      return c.isFormField;
    }, this);

    if (!this.items) {
      this.items = new Ext.util.MixedCollection();
    } else {
      this.items.clear();
    }

    this.items.addAll(fields);
  },

  validateValue : function(value) {
    var valid = true;

    this.items.each(function(f){
      valid = f.validate();

      if (!valid) {
        return false;
      }
    }, this);

    return valid;
  },

  // private
  onDestroy: function() {
    Ext.destroy(this.panel);
    Ext.ux.PolySet.superclass.onDestroy.call(this);
  },

  // private
  onDisable : function(){
    this.items.each(function(item){
      item.disable();
    });
  },

  // private
  onEnable : function(){
    this.items.each(function(item){
      item.enable();
    });
  },

  isDirty: function(){
    //override the behaviour to check sub items.
    if (this.disabled || !this.rendered) {
      return false;
    }

    var dirty = false;
    this.items.each(function(item){
      if(item.isDirty()){
        dirty = true;
        return false;
      }
    });
    return dirty;
  },

  // private
  onResize : function(w, h){
    this.panel.setSize(w, h);
    this.panel.doLayout();
  },

  // inherit docs from Field
  reset : function(){
    Ext.ux.PolySet.superclass.reset.call(this);
    this.items.each(function(c){
      if(c.reset){
        c.reset();
      }
    }, this);
  },


  onRender: function(ct, position) {
    if (!this.el) {
      var items = [];

      if (this.headerPanel) {
        items.push({
          layout: "column",
          items: [{
            columnWidth: 1.0,
            items: this.headerPanel
          }, {
            width: this.buttonColumnWidth,
            html: "&nbsp;"
          }]
        });
      }

      items.push({
        layout: "column",
        items: [{
          columnWidth: 1.0,
          items: {
            html: "&nbsp;"
          }
        }, {
          hidden: this.readOnly,
          width: this.buttonColumnWidth,
          items: Ext.apply(this.addButtonConfig, {
            xtype: "button",
            handler: this._onBtnAdd,
            scope: this
          })
        }]
      });

      this.panel = new Ext.Panel({
        layout: "anchor",
        renderTo: ct,
        autoHeight: true,
        items: items
      });

      this.panel.ownerCt = this;
      this.el = this.panel.getEl();

      this._updateItems();

      if (this.value) {
        this.setValue(this.value);
      } else {
        var panelsToAdd = Ext.num(this.addInitialPanels === true ? 1 : this.addInitialPanels, 0);
        for (var i=0; i<panelsToAdd; ++i) {
          this.addPanel();
        }
      }

    }

    Ext.ux.PolySet.superclass.onRender.call(this, ct, position);
  },

  /**
   * returns a panel config object for another row
   *
   * @private
   * @param {Ext.Panel} content the content config object for Ext.ux.PolySet.ContentPanel
   *
   * @returns {Object}
   */
  _getRow: function(content) {
    return {
      xtype: "ux-polyset-contentpanel",
      removeButtonConfig: this.removeButtonConfig,
      buttonColumnWidth: this.buttonColumnWidth,
      content: Ext.apply(content, {readOnly: this.readOnly}),
      readOnly: this.readOnly,
      listeners: {
        removeBtn: this._onBtnRemove,
        scope: this
      }
    };
  },

  /**
   * @private
   */
  _getContentPanel: function(value) {
    if (typeof this.contentPanel == "function") {
      return this.contentPanel.call(this, value);
    } else {
      return this.contentPanel;
    }
  },

  _onBtnAdd: function() {
    this.addPanel();
  },

  _onBtnRemove: function(pnl) {
    this.removePanel(pnl);
  },


  /**
   * @cfg {String} name
   * @hide
   */
  /**
   * @method initValue
   * @hide
   */
  initValue : Ext.emptyFn,
  /**
   * @method getRawValue
   * @hide
   */
  getRawValue : Ext.emptyFn,
  /**
   * @method setRawValue
   * @hide
   */
  setRawValue : Ext.emptyFn
});

Ext.reg("ux-polyset", Ext.ux.PolySet);



/**
 * helper panel class to abstract the ui of a single row
 *
 *
 * @author Michael Siebert (siebertm85@googlemail.com)
 */
Ext.ux.PolySet.ContentPanel = function(cfg) {
  Ext.apply(this, cfg);

  var removeButton;

  if (this.readOnly) {
    removeButton = {
      html: '&nbsp'
    };
  } else {
    removeButton = Ext.apply(this.removeButtonConfig, {
      xtype: "button",
      handler: this._onBtnRemove,
      scope: this
    });
  }

  Ext.ux.PolySet.ContentPanel.superclass.constructor.call(this, {
    anchor: "100%",
    layout: "column",
    items: [{
      columnWidth: 1.0,
      layout: "fit",
      items: this.content
    }, {
      width: this.buttonColumnWidth,
      items: removeButton
    }]
  });

  this.addEvents({
    /**
     * fired when the remove button was pressed
     *
     * @param pnl this panel
     */
    "removeBtn": true
  });

  this.content = this.items.get(0).items.get(0);

  if (typeof this.content.getValue != "function") {
    throw "the content option must respond to getValue()!";
  }

  if (typeof this.content.setValue != "function") {
    throw "the content option must respond to setValue()!";
  }
};

Ext.extend(Ext.ux.PolySet.ContentPanel, Ext.Panel, {
  getValue: function() {
    return this.content.getValue();
  },

  setValue: function(v) {
    return this.content.setValue(v);
  },

  _onBtnRemove: function() {
    this.fireEvent("removebtn", this);
  }
});

Ext.reg("ux-polyset-contentpanel", Ext.ux.PolySet.ContentPanel);



