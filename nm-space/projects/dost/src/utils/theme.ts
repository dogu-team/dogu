import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  initialColorMode: 'system',
  useSystemColorMode: false,

  styles: {
    global: {},
  },
  components: {
    Checkbox: {
      baseStyle: {
        control: {
          bg: 'gray.200',
        },
      },
    },
    Radio: {
      baseStyle: {
        control: {
          bg: 'gray.200',
        },
      },
    },
  },
});
// import { extendBaseTheme } from '@chakra-ui/react';

// const { Button, Tabs, List, Input, Textarea, Checkbox, Divider, Modal, Heading, Form } = chakraTheme.components;

// const theme = extendBaseTheme({
// initialColorMode: 'system',
// useSystemColorMode: true,

// styles: {
//   global: {
//     'html, body': {
//       fontSize: 'sm',
//     },
//   },
// },

// components: {
//   Button,
//   Tabs,
//   List,
//   Input,
//   Textarea,
//   Checkbox,
//   Divider,
//   Modal,
//   Heading,
//   Form,
// },
// });

export default theme;
