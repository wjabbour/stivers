import styles from './Navbar.module.scss';
import { useNavigate } from 'react-router-dom';

export default function Navbar(props) {
    const navigate = useNavigate();

    return (
        <div className={styles.navbar}>
            <div className={styles.title}>
                <div className={styles.text} onClick={() => navigate('/')}></div>
                <div className={styles.cart} onClick={() => navigate('/cart')}>Cart ({Object.keys(props.cart).length})</div>
            </div>
        </div>
    )
}