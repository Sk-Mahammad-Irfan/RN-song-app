import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs = [
    { key: 'index', label: 'Home', route: '/' },
    { key: 'find', label: 'Find', route: '/find' },
    { key: 'waves', label: 'Waves', route: '/waves' },
    { key: 'me', label: 'Me', route: '/me' },
  ] as const;

  return (
    <View
      style={ {
        position: 'absolute',
        left: 16,
        right: 16,

        // Safe area aware
        bottom: Math.max(insets.bottom, 12),

        height: 76,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',

        backgroundColor: '#13131D',

        borderRadius: 30,

        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',

        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 24,
        shadowOffset: {
          width: 0,
          height: 12,
        },

        elevation: 20,
      } }
    >
      { tabs.map((tab) => {
        const isActive =
          tab.route === '/'
            ? pathname === '/' || pathname === '/index'
            : pathname.startsWith(tab.route);

        return (
          <TouchableOpacity
            key={ tab.key }
            activeOpacity={ 0.8 }
            onPress={ () => router.push(tab.route) }
            style={ {
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            } }
          >
            <View
              style={ {
                width: 44,
                height: 44,
                borderRadius: 22,

                alignItems: 'center',
                justifyContent: 'center',

                backgroundColor: isActive
                  ? 'rgba(139,128,240,0.18)'
                  : 'transparent',

                borderWidth: isActive ? 1 : 0,
                borderColor: 'rgba(139,128,240,0.35)',
              } }
            >
              <TabIcon name={ tab.key } active={ isActive } />
            </View>

            <Text
              style={ {
                marginTop: 4,
                fontSize: 11,
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#FFFFFF' : '#777790',
                letterSpacing: 0.3,
              } }
            >
              { tab.label }
            </Text>
          </TouchableOpacity>
        );
      }) }
    </View>
  );
}

function TabIcon({
  name,
  active,
}: {
  name: string;
  active: boolean;
}) {
  const color = active ? '#A899FF' : '#5A5A72';
  const size = 22;

  const box = {
    width: size,
    height: size,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (name === 'index') {
    return (
      <View style={ box }>
        <View
          style={ {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.7,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          } }
        >
          <View
            style={ {
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: active ? color : 'transparent',
              borderWidth: active ? 0 : 1.5,
              borderColor: color,
            } }
          />
        </View>
      </View>
    );
  }

  if (name === 'find') {
    return (
      <View style={ box }>
        <View
          style={ {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.7,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          } }
        >
          <View
            style={ {
              width: 9,
              height: 1.8,
              backgroundColor: color,
            } }
          />
          <View
            style={ {
              width: 1.8,
              height: 9,
              backgroundColor: color,
              position: 'absolute',
            } }
          />
        </View>
      </View>
    );
  }

  if (name === 'waves') {
    return (
      <View
        style={ {
          flexDirection: 'row',
          gap: 3,
          alignItems: 'flex-end',
          height: size,
        } }
      >
        <View
          style={ {
            width: 7,
            height: 16,
            borderRadius: 3,
            backgroundColor: active ? color : 'transparent',
            borderWidth: 1.5,
            borderColor: color,
          } }
        />

        <View
          style={ {
            width: 7,
            height: 11,
            borderRadius: 3,
            backgroundColor: active ? color : 'transparent',
            borderWidth: 1.5,
            borderColor: color,
          } }
        />
      </View>
    );
  }

  if (name === 'me') {
    return (
      <View style={ box }>
        <View
          style={ {
            width: 9,
            height: 9,
            borderRadius: 4.5,
            borderWidth: 1.7,
            borderColor: color,
            marginBottom: 2,
          } }
        />

        <View
          style={ {
            width: 15,
            height: 8,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderWidth: 1.7,
            borderBottomWidth: 0,
            borderColor: color,
          } }
        />
      </View>
    );
  }

  return null;
}