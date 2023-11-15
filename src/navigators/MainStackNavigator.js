import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import TaskDetailNavigator from './TaskDetailNavigation';

const MainStack = createStackNavigator();

export default function MainStackNavigator() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen 
        name="Tabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <MainStack.Screen name="TaskDetail" component={TaskDetailNavigator} />
    </MainStack.Navigator>
  );
}
