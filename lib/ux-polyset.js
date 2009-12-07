
Ext.namespace("Ext.ux");

Ext.ux.PolySet = function(cfg) {
  Ext.apply(this, cfg);

  if (!this.contentPanel) {
    throw "contentPanel config option must be set!";
  }

  Ext.ux.PolySet.superclass.constructor.call(this, {
    layout: "anchor",
    autoHeight: true,
    items: [{

    }],
    buttons: [Ext.apply(this.addButtonConfig, {
      handler: this._onBtnAdd,
      scope: this
    })]
  });


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
};

Ext.extend(Ext.ux.PolySet, Ext.Panel, {
  /**
   * a config object to be mixed into the add button config.
   * can be used to customize the look'n'feel of the button
   */
  addButtonConfig: {
    text: "add"
  },

  /**
   * a config object to be mixed into the remove button config.
   * can be used to customize the look'n'feel of the button
   */
  removeButtonConfig: {
    text: "remove"
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
   * adds another panel
   *
   * fires the beforeaddpanel event which would prevent the addition
   * of the new panel
   *
   * @param {Ext.Panel} contentPanel a panel to add instead of what is specified in
   *                                  the contentPanel config object. can be undefined and
   *                                  defaults to the contentPanel config object
   * @returns {Boolean} true if the panel was added, false otherwise
   */
  addPanel: function(contentPanel) {
    if (this.fireEvent("beforeaddpanel", this) === false) {
      return false;
    }

    var pnl = this.add(this._getRow(contentPanel || this._getContentPanel()));
    this.subPanels.add(pnl.id, pnl);

    this.doLayout();
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
    this.remove(pnl);
    this.doLayout();
    this.fireEvent("afterremovepanel", this);

    return true;
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
      content: content,
      listeners: {
        removeBtn: this._onBtnRemove,
        scope: this
      }
    };
  },

  /**
   * @private
   */
  _getContentPanel: function() {
    if (typeof this.contentPanel == "function") {
      return this.contentPanel.call(this);
    } else {
      return this.contentPanel;
    }
  },

  _onBtnAdd: function() {
    this.addPanel();
  },

  _onBtnRemove: function(pnl) {
    this.removePanel(pnl);
  }
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

  Ext.ux.PolySet.ContentPanel.superclass.constructor.call(this, {
    anchor: "100%",
    layout: "column",
    items: [{
      columnWidth: 1.0,
      layout: "fit",
      items: this.content
    }, {
      width: 75,
      items: Ext.apply(this.removeButtonConfig, {
        xtype: "button",
        handler: this._onBtnRemove,
        scope: this
      })
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
