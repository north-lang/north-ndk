export default {
  name: 'app.TasksFirebase',
  component: 'app.Tasks',
  store: {
    component: 'FirebaseStore',
    apiKey: 'AIzaSyCJfqjdBBrXtwkXla6uMX3LZGOLDAgTEx0',
    authDomain: 'north-contacts.firebaseapp.com',
    projectId: 'north-contacts',
    collection: 'tasks'
  }
};
