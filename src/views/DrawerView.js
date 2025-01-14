import * as React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { SceneView, ThemeColors, ThemeContext, } from 'react-navigation';
import { ScreenContainer } from 'react-native-screens';
import * as DrawerActions from '../routers/DrawerActions';
import DrawerSidebar from './DrawerSidebar';
import DrawerGestureContext from '../utils/DrawerGestureContext';
import ResourceSavingScene from './ResourceSavingScene';
import Drawer from './Drawer';
/**
 * Component that renders the drawer.
 */
export default class DrawerView extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            loaded: [this.props.navigation.state.index],
            drawerWidth: typeof this.props.navigationConfig.drawerWidth === 'function'
                ? this.props.navigationConfig.drawerWidth()
                : this.props.navigationConfig.drawerWidth,
        };
        this.drawerGestureRef = React.createRef();
        this.getLockMode = ({ navigation, descriptors }) => {
            const activeKey = navigation.state.routes[navigation.state.index].key;
            const { drawerLockMode } = descriptors[activeKey].options;
            return drawerLockMode;
        };
        this.handleDrawerOpen = () => {
            const { navigation } = this.props;
            navigation.dispatch(DrawerActions.openDrawer({
                key: navigation.state.key,
            }));
        };
        this.handleDrawerClose = () => {
            const { navigation } = this.props;
            navigation.dispatch(DrawerActions.closeDrawer({
                key: navigation.state.key,
            }));
        };
        this.updateWidth = () => {
            const drawerWidth = typeof this.props.navigationConfig.drawerWidth === 'function'
                ? this.props.navigationConfig.drawerWidth()
                : this.props.navigationConfig.drawerWidth;
            if (this.state.drawerWidth !== drawerWidth) {
                this.setState({ drawerWidth });
            }
        };
        this.renderNavigationView = ({ progress }) => {
            return (React.createElement(DrawerSidebar, Object.assign({ screenProps: this.props.screenProps, drawerOpenProgress: progress, navigation: this.props.navigation, descriptors: this.props.descriptors, contentComponent: this.props.navigationConfig.contentComponent, contentOptions: this.props.navigationConfig.contentOptions, drawerPosition: this.props.navigationConfig.drawerPosition, style: this.props.navigationConfig.style }, this.props.navigationConfig)));
        };
        this.renderContent = () => {
            let { lazy, navigation } = this.props;
            let { loaded } = this.state;
            let { routes } = navigation.state;
            if (this.props.navigationConfig.unmountInactiveRoutes) {
                let activeKey = navigation.state.routes[navigation.state.index].key;
                let descriptor = this.props.descriptors[activeKey];
                return (React.createElement(SceneView, { navigation: descriptor.navigation, screenProps: this.props.screenProps, component: descriptor.getComponent() }));
            }
            else {
                return (React.createElement(ScreenContainer, { style: styles.content }, routes.map((route, index) => {
                    if (lazy && !loaded.includes(index)) {
                        // Don't render a screen if we've never navigated to it
                        return null;
                    }
                    let isFocused = navigation.state.index === index;
                    let descriptor = this.props.descriptors[route.key];
                    return (React.createElement(ResourceSavingScene, { key: route.key, style: [
                            StyleSheet.absoluteFill,
                            { opacity: isFocused ? 1 : 0 },
                        ], isVisible: isFocused },
                        React.createElement(SceneView, { navigation: descriptor.navigation, screenProps: this.props.screenProps, component: descriptor.getComponent() })));
                })));
            }
        };
        this.setDrawerGestureRef = (ref) => {
            // @ts-ignore
            this.drawerGestureRef.current = ref;
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { index } = nextProps.navigation.state;
        return {
            // Set the current tab to be loaded if it was not loaded before
            loaded: prevState.loaded.includes(index)
                ? prevState.loaded
                : [...prevState.loaded, index],
        };
    }
    componentDidMount() {
        // If drawerLockMode was set to `locked-open`, we should open the drawer on mount
        if (this.getLockMode(this.props) === 'locked-open') {
            this.handleDrawerOpen();
        }
        Dimensions.addEventListener('change', this.updateWidth);
    }
    componentDidUpdate(prevProps) {
        const prevLockMode = this.getLockMode(prevProps);
        const nextLockMode = this.getLockMode(this.props);
        if (prevLockMode !== nextLockMode) {
            if (nextLockMode === 'locked-open') {
                this.handleDrawerOpen();
            }
            else {
                this.handleDrawerClose();
            }
        }
    }
    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.updateWidth);
    }
    getDrawerBackgroundColor() {
        const { drawerBackgroundColor } = this.props.navigationConfig;
        if (drawerBackgroundColor) {
            return typeof drawerBackgroundColor === 'string'
                ? drawerBackgroundColor
                : drawerBackgroundColor[this.context];
        }
        else {
            return ThemeColors[this.context].bodyContent;
        }
    }
    getOverlayColor() {
        const { overlayColor } = this.props.navigationConfig;
        if (overlayColor) {
            return typeof overlayColor === 'string'
                ? overlayColor
                : overlayColor[this.context];
        }
        else {
            return 'rgba(0,0,0,0.5)';
        }
    }
    render() {
        const { navigation, navigationConfig } = this.props;
        const { drawerType, sceneContainerStyle, edgeWidth, minSwipeDistance, hideStatusBar, statusBarAnimation, gestureHandlerProps, } = navigationConfig;
        const drawerLockMode = this.getLockMode(this.props);
        const drawerBackgroundColor = this.getDrawerBackgroundColor();
        const overlayColor = this.getOverlayColor();
        return (React.createElement(DrawerGestureContext.Provider, { value: this.drawerGestureRef },
            React.createElement(Drawer, { open: navigation.state.isDrawerOpen, gestureEnabled: drawerLockMode !== 'locked-open' &&
                    drawerLockMode !== 'locked-closed', onOpen: this.handleDrawerOpen, onClose: this.handleDrawerClose, onGestureRef: this.setDrawerGestureRef, gestureHandlerProps: gestureHandlerProps, drawerType: drawerType, drawerPosition: this.props.navigationConfig.drawerPosition, sceneContainerStyle: sceneContainerStyle, drawerStyle: {
                    backgroundColor: drawerBackgroundColor,
                    width: this.state.drawerWidth,
                }, overlayStyle: { backgroundColor: overlayColor }, swipeEdgeWidth: edgeWidth, swipeDistanceThreshold: minSwipeDistance, hideStatusBar: hideStatusBar, statusBarAnimation: statusBarAnimation, renderDrawerContent: this.renderNavigationView, renderSceneContent: this.renderContent })));
    }
}
DrawerView.contextType = ThemeContext;
DrawerView.defaultProps = {
    lazy: true,
};
const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
});
