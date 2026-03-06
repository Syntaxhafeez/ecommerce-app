import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { dummyUser } from '@/assets/assets'
import { useRouter } from 'expo-router'
import Header from '@/components/Header'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, PROFILE_MENU } from '@/constants'

export default function Profile() {

  const { user } = { user: dummyUser }
  const router = useRouter()

  const handleLogout = async () => {
    router.replace('/sign-in')
  }

  return (
    <SafeAreaView className='flex-1 bg-surface' edges={['top']}>
      <Header title='Profile' />

      <ScrollView className='flex-1 px-4' contentContainerStyle={!user ? { flex: 1, justifyContent: 'center', alignItems: 'center' } : { paddingTop: 16 }}>
        {!user ? (
          // guest user screen
          <View className='items-center w-full'>
            <View className='w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-6'>
              <Ionicons name='person' size={40} color={COLORS.secondary} />
            </View>
            <Text className='text-primary font-bold text-xl mb-2'>Guest User</Text>
            <Text className='text-secondary text-base mb-8 text-center w-3/4 px-4'>Log in to view your profile, orders, and addresses.</Text>
            <TouchableOpacity onPress={() => router.push('/sign-in')} className='bg-primary w-3/5 py-3 rounded-full items-center shadow-lg'>
              <Text className='text-white font-bold text-lg'>Login/ Sign up</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* profile info */}
            <View className='items-center mb-8'>
              <View className='mb-3'>
                <Image className='size-20 border-2 border-white shadow-sm rounded-full' source={{ uri: user.imageUrl }} />
              </View>
              <Text className='text-xl font-bold text-primary'>{user.firstName + " " + user.lastName}</Text>
              <Text className='text-secondary text-sm'>{user.emailAddresses[0].emailAddress}</Text>

              {/* admin panel button if user is admin */}
              {user.publicMetadata?.role === 'admin' && (
                <TouchableOpacity onPress={() => router.push('/admin')} className='mt-4 bg-primary px-6 py-2 rounded-full'>
                  <Text className='text-white font-bold'>Admin Panel</Text>
                </TouchableOpacity>
              )}

            </View>

            {/* menu */}
            <View className='bg-white rounded-xl border border-gray-100/75 p-2 mb-4'>
              {PROFILE_MENU.map((item, index) => (
                <TouchableOpacity onPress={() => router.push(item.route as any)} key={item.id} className={`flex-row items-center p-4 ${index !== PROFILE_MENU.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <View className='w-10 h-10 bg-surface rounded-full items-center justify-center mr-4'>
                    <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                  </View>
                  <Text className='flex-1 text-primary font-medium'>{item.title}</Text>
                  <Ionicons name='chevron-forward' size={20} color={COLORS.secondary} />
                </TouchableOpacity>
              ))}
            </View>

            {/* logout button */}
            <TouchableOpacity onPress={handleLogout} className='flex-row items-center justify-center p-4'>
              <Text className='font-bold ml-2' style={{ color: '#ef4444' }}>Log Out</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}