/**
 * TouchableItem renders a touchable that looks native on both iOS and Android.
 *
 * It provides an abstraction on top of TouchableNativeFeedback and
 * TouchableOpacity.
 *
 * On iOS you can pass the props of TouchableOpacity, on Android pass the props
 * of TouchableNativeFeedback.
 */
import * as React from 'react';
import { Platform, TouchableNativeFeedback, TouchableOpacity, View, } from 'react-native';
const ANDROID_VERSION_LOLLIPOP = 21;
export default class TouchableItem extends React.Component {
    render() {
        /*
         * TouchableNativeFeedback.Ripple causes a crash on old Android versions,
         * therefore only enable it on Android Lollipop and above.
         *
         * All touchables on Android should have the ripple effect according to
         * platform design guidelines.
         * We need to pass the background prop to specify a borderless ripple effect.
         */
        if (Platform.OS === 'android' &&
            Platform.Version >= ANDROID_VERSION_LOLLIPOP) {
            const { style, ...rest } = this.props;
            return (React.createElement(TouchableNativeFeedback, Object.assign({}, rest, { style: null, background: TouchableNativeFeedback.Ripple(this.props.pressColor, this.props.borderless) }),
                React.createElement(View, { style: style }, React.Children.only(this.props.children))));
        }
        return (React.createElement(TouchableOpacity, Object.assign({}, this.props), this.props.children));
    }
}
TouchableItem.defaultProps = {
    borderless: false,
    pressColor: 'rgba(0, 0, 0, .32)',
};
