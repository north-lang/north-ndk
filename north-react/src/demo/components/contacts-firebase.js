export default {
  name: 'app.ContactsFirebase',
  component: 'app.Contacts',
  store: {
    component: 'FirebaseStore',
    apiKey: 'AIzaSyCJfqjdBBrXtwkXla6uMX3LZGOLDAgTEx0',
    authDomain: 'north-contacts.firebaseapp.com',
    projectId: 'north-contacts',
    collection: 'contacts'
  }
};
