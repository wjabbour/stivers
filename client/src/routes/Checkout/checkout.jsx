import styles from './checkout.module.scss'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { STORES } from '../../lib/constants';
import { calculate_item_count, calculate_item_price } from '../../lib/utils';
import * as http from '../../lib/http';
import Snackbar from '@mui/material/Snackbar';
import Alert from "@mui/material/Alert";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { SvgIcon } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';


export default function Checkout() {
  const KNOWN_CODES = ["STIFMO", "STIFBI", "STIHCO", "STICPR", "STISDE", "STICCO"]
  const paypalRef = useRef(null)
  const navigate = useNavigate()
  const [script_loaded, set_script_loaded] = useState(false)
  const [cart, set_cart] = useOutletContext();
  const [store, set_store] = useState('')
  const first_name_ref = useRef(null)
  const last_name_ref = useRef(null)
  const email_ref = useRef(null)
  const password_ref = useRef(null)
  const store_ref = useRef(null)
  const [first_name, set_first_name] = useState('')
  const [last_name, set_last_name] = useState('')
  const [email, set_email] = useState('')
  const [code, set_code] = useState('')
  const [bypass_paypal, set_bypass_paypal] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarText, setSnackbarText] = useState('')
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [errorSnackbarText, setErrorSnackbarText] = useState('')

  useEffect(() => {
    if (window.paypal && !script_loaded) {
      renderButtons();
      set_script_loaded(true)
    }
  }, []);

  function build_request_body() {
    const first_name = first_name_ref.current.value
    const last_name = last_name_ref.current.value
    const email = email_ref.current.value
    const store = store_ref.current.value

    return { first_name, last_name, store, email, cart };
  }

  const bypassPaypalCheckout = async () => {
    const req_body = build_request_body()
    req_body['bypassPaypal'] = true
    const response = await http.create_order(req_body)
    if (response.error) {
      setErrorSnackbarText(response.error.message)
      setErrorSnackbarOpen(true)
      return ''
    }
  }

  const renderButtons = () => {
    window.paypal.Buttons({
      createOrder: async function () {
        const response = await http.create_order(build_request_body())
        if (response.error) {
          setErrorSnackbarText(response.error.message)
          setErrorSnackbarOpen(true)
          return ''
        } else {
          sessionStorage.setItem('order_id', response.success?.data?.order_id)
          return response.success?.data?.order_id
        }
      },
      onError: function () {
        setErrorSnackbarText('Encountered error during checkout')
        setErrorSnackbarOpen(true)
      },
      onApprove: async function () {
        const response = await http.capture_order(sessionStorage.getItem('order_id'))
        if (response.error) {
          setErrorSnackbarText(response.error.message)
          setErrorSnackbarOpen(true)
          return ''
        } else {
          setSnackbarText('Transaction successful')
          setSnackbarOpen(true)
        }
      },
      style: {
        shape: "rect",
        color: "gold",
        layout: "vertical",
        tagline: false
      },
      onError: (error) => {
        console.warn(error);
      }
    }).render(paypalRef.current);
  };

  const handle_first_name = (event) => {
    set_first_name(event.target.value);
  };

  const handle_last_name = (event) => {
    set_last_name(event.target.value);
  };

  const handle_email = (event) => {
    set_email(event.target.value);
  };

  const handle_code = (event) => {
    set_code(event.target.value.toUpperCase());
    if (KNOWN_CODES.includes(event.target.value.toUpperCase())) {
      set_bypass_paypal(true)
    }
  };

  const handle_store = (event) => {
    set_store(event.target.value);
  };

  function handleSnackbarClose() {
    setSnackbarOpen(false);
    setErrorSnackbarOpen(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.back__button} onClick={() => { navigate('/') }}>
        <SvgIcon fontSize='inherit'><ArrowBackIcon /></SvgIcon>
      </div>
      <div className={styles.card}>
        <TextField inputRef={first_name_ref} className={styles.text__field} onChange={handle_first_name} id="" label="First Name" variant="filled" />
        <TextField inputRef={last_name_ref} className={styles.text__field} onChange={handle_last_name} id="" label="Last Name" variant="filled" />
        <TextField inputRef={email_ref} className={styles.text__field} onChange={handle_email} id="" label="Email" variant="filled" />
        <FormControl id={styles.move} className={styles.text__field} variant="filled" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel>Store</InputLabel>
          <Select
            inputRef={store_ref}
            value={store}
            onChange={handle_store}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {STORES.map((store) => {
              return <MenuItem value={store}>{store}</MenuItem>
            })}
          </Select>
        </FormControl>
        <TextField className={styles.text__field} onChange={handle_code} label="Code" variant="filled" />
        <div className={styles.subtotal__container}>
          <div className={styles.subtotal}>
            Subtotal ({calculate_item_count(cart)} items): ${calculate_item_price(cart)}
          </div>
          <div className={`${styles.checkout__container} ${bypass_paypal ? styles.hidden : styles.visible}`} ref={paypalRef}>
          </div>
          <div className={`${styles.tooltip} ${bypass_paypal ? styles.hidden : styles.visible}`}>
            <Tooltip title={
              <Typography variant="h6" gutterBottom>
                1. Please disable Adblock or manualy allow the PayPal window to open.
                <br></br>
                <br></br>
                2. Please do not refresh this page as you are entering your payment info.
              </Typography>
            }
            >
              <IconButton>
                <InfoOutlinedIcon></InfoOutlinedIcon>
              </IconButton>
            </Tooltip>
          </div>
          <div className={`${styles.bypass__paypal__checkout} ${!bypass_paypal ? styles.hidden : styles.visible}`}>
            <Button onClick={bypassPaypalCheckout} variant="contained">Checkout</Button>
          </div>
        </div>
      </div>
      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={2500}
        onClose={handleSnackbarClose}
      >
        <Alert severity="error">{errorSnackbarText}</Alert>
      </Snackbar>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        message={snackbarText}
        onClose={handleSnackbarClose}
      />
    </div>
  )
}