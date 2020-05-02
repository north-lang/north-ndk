export default {
  name: 'app.App',
  component: 'App',
  // menuAlwaysTemporary: true,
  basename: '/north-react', // Root of site is https://redgeoff.github.io/north-react
  menu: {
    component: 'Menu',
    items: [
      {
        path: '/',
        label: 'Home',
        content: {
          component: 'app.Home'
        }
      },
     
      {
        path: '/contacts',
        label: 'Contacts',
        items: [
          {
            path: '/contacts',
            label: 'Contacts LocalStorage',
            content: {
              component: 'app.ContactsLocalStorage'
            }
          },
          {
            path: '/contacts-firebase',
            label: 'Contacts Firebase',
            content: {
              component: 'app.ContactsFirebase'
            }
          }
        ]
      },
      {
        path: '/tasks',
        label: 'Todo Beispiele',
        items: [
          {
            path: '/tasks',
            label: 'Todo Liste LS',
            content: {
              component: 'app.TasksLocalStorage'
            }
          },
          {
            path: '/tasks-firebase',
            label: 'Todo Liste FB',
            content: {
              component: 'app.TasksFirebase'
            }
          }
        ]
      },
    
  

      {
        path: '/contact/edit',
        label: 'Cryption',
        content: {
          component: 'Text',
          text: 'North enthält eine sichere Verschlüsselung um persönliche Daten zu schützen. Versuchen sie die Daten dieser Seite im Quelltext zu suchen, indem sie die Taste F12 oder Rechtsklick und dann Seitenquelltext anzeigen.\n Sie werden sehen dass man keine persönliche Daten vorfindet.  ',
          
        }
      },
      {
        path: '/contact-no-north',
        label: 'Feld Beispiel',
        content: {
          component: 'app.ContactNonorth'
        }
      },
      
    ]
  }
};
