/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import AuthErrorDialog from './AuthErrorDialog';
import Caption from './Caption';
import Code from './Code';
import Footer from '../Footer';
import QRCode from './QRCode';
import Password from './Password';
import Phone from './Phone';
import { loadData } from '../../Utils/Phone';
import AppStore from '../../Stores/ApplicationStore';
import AuthStore from '../../Stores/AuthorizationStore';
import './AuthForm.css';

class AuthForm extends React.Component {
    state = {
        data: AuthStore.data
    };

    componentDidMount() {
        setTimeout(this.loadContent, 100);
    }

    loadContent = async () => {
        const { data } = this.state;
        if (data) return;

        try {
            AuthStore.data = await loadData();

            this.setState({ data: AuthStore.data });
        } catch (error) {
            console.error(error);
        }
    };

    render() {
        const { authorizationState: state, onChangePhone, onRequestQRCode } = this.props;
        const { data } = this.state;
        const { defaultPhone } = AppStore;

        let control = null;
        switch (state['@type']) {
            case 'authorizationStateWaitOtherDeviceConfirmation': {
                control = (
                    <QRCode
                        state={state}
                        onChangePhone={onChangePhone}
                    />);
                break;
            }
            case 'authorizationStateWaitPhoneNumber':
            case 'authorizationStateWaitRegistration':
            case 'authorizationStateWaitEncryptionKey':
            case 'authorizationStateWaitTdlibParameters':
            case 'authorizationStateWaitTdlib': {
                control = (
                    <Phone
                        defaultPhone={defaultPhone}
                        data={data}
                        onRequestQRCode={onRequestQRCode} />);
                break;
            }
            case 'authorizationStateWaitCode': {
                const { terms_of_service, code_info } = state;

                control = (
                    <Code
                        termsOfService={terms_of_service}
                        codeInfo={code_info}
                        onChangePhone={onChangePhone}
                        data={data}
                    />
                );
                break;
            }
            case 'authorizationStateWaitPassword': {
                const { password_hint, has_recovery_email_address, recovery_email_address_pattern } = state;

                control = (
                    <Password
                        passwordHint={password_hint}
                        hasRecoveryEmailAddress={has_recovery_email_address}
                        recoveryEmailAddressPattern={recovery_email_address_pattern}
                        onChangePhone={onChangePhone}
                    />
                );
                break;
            }
            default:
                break;
        }

        return (
            <div className='authorization-form' onLoad={this.handleLoad}>
                <div className='owa_sidebar'>
                    <div className='owaLogoContainer'>
                        <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABsCAYAAACiuLoyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkMwQzQ2MDA4RjEzRTExRTFCMzNFQTMwMzE5REU3RjExIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkMwQzQ2MDA5RjEzRTExRTFCMzNFQTMwMzE5REU3RjExIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QzBDNDYwMDZGMTNFMTFFMUIzM0VBMzAzMTlERTdGMTEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QzBDNDYwMDdGMTNFMTFFMUIzM0VBMzAzMTlERTdGMTEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5qf500AAAGPUlEQVR42uxdOXLjRhRt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' />
                    </div>
                </div>
                <div className='authorization-form-content'>
                    {/* <Caption state={state} /> */}
                    <div class="signInImageHeader" role="heading" aria-label="Outlook Web App ">
                        <img class="mouseHeader" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAacAAAA3CAYAAACo/oVvAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjE3MDNDRjUyRjEzRDExRTE4QzQxRkZBNzQzOUQyQTA5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjE3MDNDRjUzRjEzRDExRTE4QzQxRkZBNzQzOUQyQTA5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTcwM0NGNTBGMTNEMTFFMThDNDFGRkE3NDM5RDJBMDkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTcwM0NGNTFGMTNEMTFFMThDNDFGRkE3NDM5RDJBMDkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6fCYPkAAATVklEQVR42uxdTYwjRxWutWYTfoK2NwlwQLA9oEACQutFCofsYXokIqEAmh7xIw6RxkY5ICE0YyEOwMEzB4QQCHtuOSDGI3EgF8YGIUUIadsS5gRMj8IhgMh6DigSsNAJBAJKFNyu6rWn+73u+uu2Z/d9kmeTGburXPXe+957VfXqAiNUj9bojdRvAta5vk4Dkxknb/LzRuq3e5Ox2qXBIRDubKwYGo/65KczeXnAX8PJazwxJCENM4FAIBDKI6fWKCYif/LaEP/KfCb+2Z+8BtN/O9cjGnYCgTCxDTdSji1lEAiK5NQauZOf7cmrodmOL16dybP2J/92iaQIBAKBoE9OrdGuICYbcMSztibPbU0Iqk9TQDhn3n6cyj4G/nLZ2OHimYl/pH5rHk1gfe5cv0ATWoqMxNFgeq00moz3ZRocedRyFaU1OrZITPOII7GjyfM751gA3clr51x/B4I6+BrqGMkOmAJ6hidIy/ZzyTEsD1ugY94aNWhoTMmJe1o3J696zmdjJd2bvNaF13jh9ouxVfH7LqLICWLjfnDOSKkjSDsen07BGBHuTATA79YsPBd7hlfCc4c0jaXYByfHUdmiAZLHChgR8JDUyVHMeDtvkONdjgUpxe9piTAXM+SN6aaJzvXmORmzHRKbux4Dll1/9Sw8188hF5NIx6PIqTL4ObbTm9pXbh8JSpETZ/0jZHCjKdHE+e88YoLJKs6bXxORFkMIiow+4TxHTq7IOOh63F6OUfMNngt9dkwGsjRsG/6dAJITX1+qI8QUk1LXqDV+eBKLkNoiaiMQlht840NfMkKRxUbO31wD3VijqKki8DmqA7bTjqNx15IT9/p2cogptKTYPYSgYq/xgKaEcE4wVCSYIniGf1f5HK03VRc17QOOBhGUYuSE7TprWa/ywAkK9jx5eoNAWHZg8qu+sw72uMfGxMf7Ugf0jyKnctBI/X+IyAltjJAmJx41eaACciIpA00g5MW8DwJhucDXbEJLEQ70mbGF59IW8qrAo6G0Y3IoHPswMy+0hFGIlQJCaJWo3JGoFtEGJs7JHGiEvcBIO6qb1QWc71OQeo+MQXAK3heWVg2DC7gnvGqXweuFiXIMme3yUVwh10S7dUA5o1Tb4QKMBtSvjOx842enV17+7+ubF2sXXvyev/qM5NMDYMx1dtZtAM8NU4TE5UxtMxJtIa8OUDTUu01SWTmJdadLw1ZMTj44sOXv6Okx+JCvPzexCeLJvQEose7p+Q7gjaZPzN+QeE694H3rDN7dZUpKsuWkEuJoMF4+qs94qjbSbDs29DvCoSlKYSVFgT3GN7zE47CnvNtTf5y8nLlpJh7tF370x+8/+3z06fc+cO9J/P8Pf+u3B088crkpQVIDll2n9TWcOh8gkDESYamMnWctcpo5Qi5I0mXOKZc5D3G+gsrkKX9s/Mw4z3Ssz7LLJtuVkBM+b5EYu7ACHcQyA0Eex6zkeJaDSlIjrVEICN0GQE4EPtm7TL9qhyNIKo5Om8prD1xWjhADJWss43WZuLZiq+RxSvoKE5NIV3/5xy/s/P4v/5lGGM+9+O+P/ut/r1/83NUHnxz+6eWnJ796pkB+g0k7UUp/XKWzLPDieBI5HQB6savw/d2MQVB1OHlVg22Wf9i8LcbBbt1MOSesnLbVAPXvMGXn+ikCczUi4fmxyb92h5NCmxWlg1ujsXAYe4Y2aHbESMWB5eOyB5FkDYmaogoXTQeSHt/dTkqOqOJso5wUP8+mUk6Fv/fYgJjmsTOtsmFelifPMGMHyZvzijghpi89+u77Phb/9+MfcL6+ev+b/hq9+trjj7zzzUFMXBKt9SUioTysAboXCCMbZqJg+TEzi5riMeSVUA6YXBWUpG7msdF5r1n78djflMwO2G1bHVsS9nMg8Tlb8n8g5F/GjrrTObalj7M6jm2JzEqiK8eC8DLkdBXx3KpCAApbWYZLvW/pFwPDY/xly5M7yhG2+VJS8SspH9UUESjWhwOpdTVOTNg2/0i0sZlqe130CfPU6wzfIVoJMcW49cprD37zE1dOpwP83K3v3Pz7q2//wecfeuqelQu3JFscShBOkXJi+mDiuOmvN83GUMfQu9PPmh1IPtCUDfO29dJWbqETwOUuykRctu1ca3TE9G6P4CXrTDZqzORG5xntdCm7FeRBJxUSQJgzWFWSJJS2WZcIp8PS76DhXgVklMbC4AbI39iUOOIK8FzZGyDptUaraDqECytmKPaQVMp4ztDuCnLrAIQRK+eJ8eHu+eiSk6gUMcWII6THJhHSr27+k21++IGvxgQVR0zhn1954jH3bTKpjj5A3LJ3nbmA/g1Sz05HyhuSEZAHyHNfwcA4iK4O5ubXFf2pA5FMTBLXNNOIDaTdSLRdF061j0RRem3biZpi7OfISgOQlZ4l+T9g0NoXt+dFczafUVnXSI9C1YWSw+qnYg7jNi+JPkK8c8YerDBskbE6AojEhYQE3Fi0EUMhJ0T8Pc3Js4aAIXUEcTTR6ErB2CPt98TaImT0Yo+pZ+m6CczbR/t65fK9O88+H4UPvHXlb2+5WPv1Jz94/3cnRNV+16V7bn77U+4vJeU3u24qt57g5+penIfPrmnJRLoeMM59yTGEypdF08gY/j67or305xJHQcVxSztC8bi2gHb7KcfJB2RatW1dmWtkHDN8k8E+8P5tS+SUPg6UbHwaI3NWZ3DKNinGsKvY/rydiBhfR+oiMtgSaVso9cc3bU36XVsSEzw2SF/c6Wgj46Xu3XAD3UM8Fhcxcp4RMc0bWthYJIunlRNTjDil9/GHnfo77rv4u1/84aWfvnDr1c88+p77nv7JU498RKEHh8DvZA7NbgBR+LjAUZSp4QfN2VBS1lzACVotKPQciLmNMv1QS7G5c8aqN63HWVRgunN9E5HpKg70+wpRE3bdSt1SGtJJyfxmbuQ408cQSbG5mu3Llbrjf4dk5rbNqymm2qokJwK8RTURPt1Io4UIBNTONujZ6x7M5grRlUyNqHptysQ0T1A/fPL9m7/5ytXLP//ihx56+rPv+5pi+4GyczXbHl30HJ11J/V6elzWdpCIKZKc25akDBWPp8otBfy9gaW2VbCtPM4wednsZ1choxEJghiDDqs61Erd8fftYc5yLafThMXDBx0Hk3MdfG73C714/F4a0y3g+6DHrOs9wnl2NSU1Be4Ru4rRzUCS+NYUSU9mCzkUoe8prdvw8R5LyHCRgdO5PqcF6k+5O0LrAKkWjVe/xH6OlY9ocHuwpxn5Z3Vb9dwUj6AgGfdrOV7UokEECQvIvoXnylTU9hBiNIuqufKqRxo4MUEeXq/0c1Tm0dNGRt4hpwMuk+Qrkp7MBgofMHRdC7LlKNqTvtZGBrhMEGPlXQYKRfuHmvLvMDvVyvc0dbIH2Nu6ImFGTP9QMTRua1har2pyckFDSPAkjaCOIkeAsfcKlDqw9L2g9Y+risS0m0NMi7i4cqDofXoKYxsUzFVRVDWUiALUN1DAODW0J4cGc3BoxemRQwMwzn2Dfto489S3/Nm60uf1M25g28uyIcJlBJnoNbK4PbaI/MusyxYayQDfbtxeImLCtml7OWTgSpCbDvF5kn0r6ufQ4tx6CuMYWJarSyXoZgMkc3nj3Gfw5hHX6LubLcecGJLTiYHuQAfO3RUxSA4gTEElSo1PyN0eOZUdTY4RYQwKQncbMHkOdkZjccR01ujMp2ecKRFlU6G+UlQKl0nyEF2qa3jTV4DfHS3giIep41VVWm9D0oHAjTEv25OOvuKNEa0F6BQ2do7h5436v8Ky1Y/VUyxmqCMRAq05lYtTQ2FcFLDin80l6NsQIB4fUFyZLeQQeflnxiFbw083AqovydyakVMVZybxHbSqW8IhXWuwMm+COGfAyMmrsA9rFDURDOFNUy1V7c7Lj5w6ABHtzhk36OoXmSzFADCKHjt7xoeuZC8fDeT3dmpexoWA6TLIKWqIZ+VUeJWwbxQiE3RxqYTUQBXoIs7LgVIh2zIA76xL73rSlfdAwrHzMpFINSV8lgPV1OPcOufPP1eRE+a1ydbwMhGmWJlcSUUk2N04Uj+nEetLjJ+DgUohHUzTOouNoAJgbL05XYKrkMsQX7ZMks+SM0HwJgsT/b18DlPrkEzbI2fcXtl11lWuXCl37BYcOXEB7IHha/nnnbZAA1nNjanLvr5itqNNj+iigijKWwpinJVeiZYwgiraWecbOGIBkOGo58yN7I678XkwVpoyfXoOo5pFyK+z4CAhLb9RchPuITIgcf58s8SoCWpzvyJjvdzKxxd3x5nvaCMnzdMfLmL0E5wAhtTWRhlobeREcXzCafXkZYug8nbWwQVZVVLY0M27ntCNNaAvsnJyalm3FqWTV0vLBsBFXs0jTPg6mpgEdyse+41So878MQCd1dpthUJKSJTihc6uNsgOBmZQYAFwtfLM5ReEtIVAUojUUwdZ9CXaNi+zApfX0fPSOJni1dQXF0H1ATmtI3MXKHzfAIgWN5A57RvK2doCxs0xzNb4pZETpjPmqU/ozJOrYaPqhjpZz2RR1FKLJjYVjPrnD+FipS86JVzedYB4ZkXlN2ylmmyG52US3RAM+c3TrW3EKy8yhIyZVhDnSu5kDIhujp1HB8tGUENETjwL3zvIPBc2ZCqHaMNSHBF7JCDrcLrW5CqL7UKd0c2QwI6Eqo1yDJzuHQkHq0ybChbQraWMURf80vzyLnMjzK8axwp1ylS7Do0jCW7YF+VRqwpuj2HrKvpzsAMoMaYg+yCx6RdpTe6OkmlHdZzyCKrqFC40lleZ3hZyGYO4bRiRQfNvfpWJruOkR4qQXB1a6RFc5DWymDY+RJxQR3ns9HRy28LYuVqOIGyPpndi1YDIJcwhqF3DCb6BEINsJeIBMomewkQcWVenco3fPuiFp640VuhnG2wDTk90EXJUvwp7dueSAwiiuZLzZ2AHGKu9upuPZZCRUzuedyCR0hlrbCoaIEThaeuE3nEUR9n5ao06IHnYumFW72oMFXkJmJ1rKzwNG32A6KSO46SWZcPt0TSDVgOUqsnw8y6xsN5UYkgupPEAHDOsGgS/A0Qm/MYE4qhwUPIvpDM1Dm1WFjrXdxGHISblI2nvis8ZRA6haAMzsns5zorKdeT4ZYD2xqqLGCSncoIqJp5IywDAZ6lc44iMk3uI6JaKvjvCQB4b6Jo/tRkyss3b2lFwuPT6U1ZUlv88nVRZW4qg8rNYujopr2ezYAV1VlcAIc3bBZUowoHwVmIlOAGUIW74CsPvik8TUyitmK1RwLK5e2eqDK3RHuOLlGHKMDaE9zN/W2PE9HYkQRU1/ClRzF+LzAd/m+nccQILCzQfvvCW+lPhThs7/t09IeQeMv6bhQa/NboKeHGOMFyBUKzsXTbc697K8QD3DAt9Qv1tihI2DURx1is6qhAY/r3os3UDYsyTs2MwkmmNtoQs9xFjE8/1hhh3G2tVDSHbiU5HqfZ8oV8eqKOYw6UeATYsRhZ56AFObh2pzShDUGvgfM3uaWsj9q9n+N0SW9xj0H1g3CZtMzxlfNserSAKHhPUakGkkXxJXzNy4Dut1Ac+USAHiWDaEvW1WsJo6pDTPjKwviAp+x5WvsOQbHFtKNYVU4lYW0IO6mAqYbZVWk0ZbRmQZSQoPmfjHBkzWUwfsvz1oMCgz00kreYJskh0N5obU1sRaTDX1swR5uQ436aX84wx42fgbGGr1JTeWce7D0Qy25KRTCjmwgXmK5CcK+w2Yxl0UzKZ2KQxm6Us3QKbe4YPajmDFacdrom0ju2T4ntKEVM2rWFSHLFntMbB2++yqjE7eDq28LRQMWJNZKFn6du0Si/Uyp8fGqUezNEvJXLKP78UGKWz8jeXzGdGEqekXuAAqWKT4dXFvQJiSuTajr2aZR7sO5zyDovsrskkCxLlOJD1Ank0GbsBYhfdufaLiOmMfalJCGvs3a5aIKlkgXJ1+kxzBVI11JE1o8hvWe2xqsHJxMRhiESofU3TMWgaEmQw7b/eDas6WF8wQQ1RI2q+xblfQkQ2r1/XmP4ZoYQkuhptR2LeVKOTrkImQBYNZO7CkvS7B+i1/C25Mwc21LAJ5qTO7WJT0TaFwiZk7OmKgsDsTl8817uRk+ZJh9iBUNK+1Vpd/CT+NSFAWzl9GQtB308J7iEzuTyPp46GIuzGNnr0EUHZA/rIlOaiNeqK775R4E0mO8cGVuaA56NX5+SgyCMKRfuHGko9BsYqUBorng7FUmAeK7OeYBzh8DUTaExMEaeXT0pLOSWO0GyeofNppvOc1sHxnIxvinWs7RzjjOm2LZjJn25WAT7qoTpvjRzblMzXocgk2bTLPbEOncybm2OTDvOyABcshL7QFc9RRYvO6b54GeGqqoDi2barrwbNUxDuQr4/fsKcrj65kwDPc1UydtbO2N+QcN7m4o0MacbRT7FtMtdLvhuwnclSQHOSlRlpeblAGkcgEAh3MDnZb1uenAxQo1kmEAgEwrKByIlAIBAIRE4EAoFAIBA5EQgEAoHIiUAgEAgEIicCgUAgEDkRCAQCgUDkRCAQCAQiJwKBQCAQiJwIBAKBQEjh/wIMADjrrMZtek4IAAAAAElFTkSuQmCC" alt="Outlook Web App " />
                    </div>
                    {control}
                    <Footer />
                </div>
                <AuthErrorDialog />
            </div>
        );
    }
}
export default AuthForm;
