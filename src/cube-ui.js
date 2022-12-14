import Vue from 'vue'

// By default we import all the components.
// Only reserve the components on demand and remove the rest.
// Style is always required.
import {
  Button,
  DatePicker
} from 'cube-ui'

Vue.use(Button)
Vue.use(DatePicker)
