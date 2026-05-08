sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], (Controller, Fragment, MessageBox, JSONModel) => {
    "use strict";

    return Controller.extend("simpleshoppinglistui.controller.ShoppingList", {

        onInit() {
            const oDialogModel = new JSONModel({
                title: "",
                name: "",
                quantity: "",
                unit: "",
                category: ""
            });
            this.getView().setModel(oDialogModel, "dialog");
            this._oDialog = null;
            this._oEditContext = null;
        },

        onAddItem() {
            const oModel = this.getView().getModel("dialog");
            oModel.setData({ title: this._getText("createItem"), name: "", quantity: "", unit: "", category: "" });
            this._oEditContext = null;
            this._openDialog();
        },

        onEditItem(oEvent) {
            const oContext = oEvent.getSource().getBindingContext("shoppingModel");
            const oObject = oContext.getObject();
            const oModel = this.getView().getModel("dialog");
            oModel.setData({
                title: this._getText("editItem"),
                name: oObject.name,
                quantity: String(oObject.quantity),
                unit: oObject.unit,
                category: oObject.category
            });
            this._oEditContext = oContext;
            this._openDialog();
        },

        async _openDialog() {
            if (!this._oDialog) {
                this._oDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "simpleshoppinglistui.fragment.ShoppingItemDialog",
                    controller: this
                });
                this.getView().addDependent(this._oDialog);
            }
            this._oDialog.open();
        },

        _validateDialog() {
            const oModel = this.getView().getModel("dialog");
            const oData = oModel.getData();
            let bValid = true;

            const fields = [
                { id: "nameInput", value: oData.name, msgKey: "nameRequired" },
                { id: "quantityInput", value: oData.quantity, msgKey: "quantityRequired" },
                { id: "unitInput", value: oData.unit, msgKey: "unitRequired" },
                { id: "categoryInput", value: oData.category, msgKey: "categoryRequired" }
            ];

            fields.forEach(({ id, value, msgKey }) => {
                const oInput = this._oDialog.byId(id);
                if (!value || !String(value).trim()) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText(this._getText(msgKey) || `${id} is required`);
                    bValid = false;
                } else {
                    oInput.setValueState("None");
                }
            });

            return bValid;
        },

        async onSaveItem() {
            if (!this._validateDialog()) {
                return;
            }

            const oDialogData = this.getView().getModel("dialog").getData();
            const oPayload = {
                name: oDialogData.name.trim(),
                quantity: parseFloat(oDialogData.quantity),
                unit: oDialogData.unit.trim(),
                category: oDialogData.category.trim()
            };

            try {
                const oShoppingModel = this.getView().getModel("shoppingModel");

                if (!this._oEditContext) {
                    const oListBinding = oShoppingModel.bindList("/ShoppingItems");
                    oListBinding.create(oPayload);
                    await oShoppingModel.submitBatch("$auto");
                } else {
                    await this._oEditContext.setProperty("name", oPayload.name);
                    await this._oEditContext.setProperty("quantity", oPayload.quantity);
                    await this._oEditContext.setProperty("unit", oPayload.unit);
                    await this._oEditContext.setProperty("category", oPayload.category);
                    await oShoppingModel.submitBatch("$auto");
                }

                this.onCancelDialog();
                this.byId("shoppingItemsTable").getBinding("items").refresh();
            } catch (oError) {
                MessageBox.error(oError.message || "An error occurred while saving.");
            }
        },

        onDeleteItem(oEvent) {
            const oContext = oEvent.getSource().getBindingContext("shoppingModel");
            MessageBox.confirm(this._getText("deleteConfirmText"), {
                onClose: async (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        try {
                            await oContext.delete("$auto");
                            this.byId("shoppingItemsTable").getBinding("items").refresh();
                        } catch (oError) {
                            MessageBox.error(oError.message || "An error occurred while deleting.");
                        }
                    }
                }
            });
        },

        onCancelDialog() {
            if (this._oDialog) {
                this._oDialog.close();
                this._oDialog.destroy();
                this._oDialog = null;
            }
        },

        _getText(sKey) {
            const oBundle = this.getView().getModel("i18n").getResourceBundle();
            return oBundle.getText(sKey);
        }
    });
});
