

import UIComponent from '../ui-component';
import access from '../access';
import utils from '../utils';
import uberUtils from '../uber-utils';
import DateField from '../fields/date-field';
import { Reorder } from './reorder';
import globals from '../globals';
import registrar from '../compiler/registrar';

export default class Store extends UIComponent {
  _className = 'Store';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'where',
            component: 'Field'
          }
        ]
      }
    });

    // For mocking
    this._access = access;
    this._globals = globals;
    this._registrar = registrar;

    if (!props || !props.muteDidLoad) {
      this._emitDidLoad();
    }
  }

  async _tryAndHandleError(promiseFactory) {
    return uberUtils.tryAndDisplayErrorIfAPIError(promiseFactory);
  }

  _shouldSetToLastOrder(order, reorder) {
    return (order === null || order === undefined) && reorder;
  }

  async createDoc(props) {
    return this._tryAndHandleError(() => {
      // Omit values based on access
      const fieldValues = this._access.valuesCanCreate(props.form, {
        default: false
      });

      const id = props.form.getValue('id');
      let order = props.form.getValue('order');

      if ((order === null || order === undefined) && !props.reorder) {
        order = Reorder.DEFAULT_ORDER;
      }

      return this._createDoc({ ...props, fieldValues, id, order });
    });
  }

  async getDoc(props) {
    return this._tryAndHandleError(async () => {
      if (props.id) {
        return this._getDoc(props);
      } else {
        // Reuse the logic in _getAllDocs to query with "where" and return the first doc
        const docs = await this._getAllDocs({ ...props, showArchived: null });
        return docs.edges.length > 0 ? docs.edges[0].node : null;
      }
    });
  }

  async getAllDocs(props) {
    return this._tryAndHandleError(() => {
      return this._getAllDocs(props);
    });
  }

  async _upsertDoc(props) {
    const id = props.id;

    let exists = false;

    if (id) {
      exists = await this._hasDoc({ id });
    }

    if (exists) {
      return this.updateDoc(props);
    } else {
      return this.createDoc(props);
    }
  }

  async upsertDoc(props) {
    return this._tryAndHandleError(() => {
      const id = props.form.getValue('id');

      return this._upsertDoc({ ...props, id });
    });
  }

  async updateDoc(props) {
    return this._tryAndHandleError(() => {
      // Omit values based on access
      const fieldValues = this._access.valuesCanUpdate(props.form, {
        default: false
      });

      const id = props.form.getValue('id');
      const order = props.form.getValue('order');

      return this._updateDoc({ ...props, fieldValues, id, order });
    });
  }

  async archiveDoc(props) {
    return this._tryAndHandleError(() => {
      return this._archiveDoc(props);
    });
  }

  async restoreDoc(props) {
    return this._tryAndHandleError(() => {
      return this._restoreDoc(props);
    });
  }

  _emitError(err) {
    this.emitChange('err', err);
  }

  _now() {
    // We use a DateField to avoid Firestore's automatic conversion of Date's to Firebase style
    // timestamps.
    const date = new DateField({ now: true });
    return date.getValue();
  }

  _buildDoc({ fieldValues, id, userId, order }) {
    const createdAt = this._now();

    return {
      id: id ? id : utils.uuid(),
      archivedAt: null, // Needed by the UI as a default
      createdAt,
      updatedAt: createdAt,
      userId: userId ? userId : null,
      order,
      fieldValues
    };
  }

  _setDoc({ doc, fieldValues, archivedAt, order }) {
    if (fieldValues !== undefined) {
      // Merge so that we support partial updates
      doc.fieldValues = Object.assign(doc.fieldValues, fieldValues);
    }

    if (archivedAt !== undefined) {
      doc.archivedAt = archivedAt;
    }

    doc.updatedAt = this._now();

    if (order === undefined) {
      // Set to null instead of setting to undefined as stores like Firebase don't support undefined
      // values
      doc.order = Reorder.DEFAULT_ORDER;
    } else {
      doc.order = order;
    }

    return doc;
  }

  _getUserId() {
    if (this._registrar.client) {
      const session = this._registrar.client.user.getSession();
      if (session) {
        return session.user.id;
      }
    }
  }
}
