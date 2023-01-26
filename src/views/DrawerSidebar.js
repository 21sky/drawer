import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationActions, } from 'react-navigation';
/**
 * Component that renders the sidebar screen of the drawer.
 */
class DrawerSidebar extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.getScreenOptions = (routeKey) => {
            const descriptor = this.props.descriptors[routeKey];
            if (!descriptor.options) {
                throw new Error('Cannot access screen descriptor options from drawer sidebar');
            }
            return descriptor.options;
        };
        this.getLabel = ({ focused, tintColor, route }) => {
            const { drawerLabel, title } = this.getScreenOptions(route.key);
            if (drawerLabel) {
                return typeof drawerLabel === 'function'
                    ? drawerLabel({ tintColor, focused })
                    : drawerLabel;
            }
            if (typeof title === 'string') {
                return title;
            }
            return route.routeName;
        };
        this.renderIcon = ({ focused, tintColor, route }) => {
            const { drawerIcon } = this.getScreenOptions(route.key);
            if (drawerIcon) {
                return typeof drawerIcon === 'function'
                    ? drawerIcon({ tintColor, focused })
                    : drawerIcon;
            }
            return null;
        };
        this.handleItemPress = ({ route, focused, }) => {
            if (focused) {
                this.props.navigation.closeDrawer();
            }
            else {
                this.props.navigation.dispatch(NavigationActions.navigate({ routeName: route.routeName }));
            }
        };
    }
    render() {
        const ContentComponent = this.props.contentComponent;
        if (!ContentComponent) {
            return null;
        }
        const { state } = this.props.navigation;
        if (typeof state.index !== 'number') {
            throw new Error('The index of the route should be state in the navigation state');
        }
        return (React.createElement(View, { style: [styles.container, this.props.style] },
            React.createElement(ContentComponent, Object.assign({}, this.props.contentOptions, { navigation: this.props.navigation, descriptors: this.props.descriptors, drawerOpenProgress: this.props.drawerOpenProgress, items: state.routes, activeItemKey: state.routes[state.index] ? state.routes[state.index].key : null, screenProps: this.props.screenProps, getLabel: this.getLabel, renderIcon: this.renderIcon, onItemPress: this.handleItemPress, drawerPosition: this.props.drawerPosition }))));
    }
}
export default DrawerSidebar;
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
