import { App } from 'vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmService from 'primevue/confirmationservice';

// PrimeVue Components
import Button from 'primevue/button';
import Menubar from 'primevue/menubar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

// Import PrimeVue styles
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

const components = [
  Button,
  Menubar,
  DataTable,
  Column,
  Toolbar,
  Dialog,
  InputText,
  Dropdown,
  Toast,
  ConfirmDialog,
];

const registerPrimeVue = (app: App) => {
  app.use(PrimeVue, { ripple: true });
  app.use(ToastService);
  app.use(ConfirmService);

  // Register components globally
  components.forEach((component) => {
    app.component(component.name, component);
  });
};

export default registerPrimeVue;
