import { useAuth, useSignUp } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";

export default function Page() {
    const { signUp, errors, fetchStatus } = useSignUp()
    const { isSignedIn, isLoaded } = useAuth()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [code, setCode] = React.useState('')
    const [showEmailCode, setShowEmailCode] = React.useState(false)

    const onSignUpPress = async () => {
        if (!isLoaded) return;

        // We use signUp.password for common email/password signups with additional fields
        // In Clerk v5, this returns a result that can be checked for errors
        const { error } = await signUp.password({
            emailAddress,
            password,
            firstName,
            lastName,
        })

        if (error) {
            console.error(JSON.stringify(error, null, 2))
            return
        }

        // Send the email verification code
        await signUp.verifications.sendEmailCode()
        setShowEmailCode(true)
    }

    const onVerifyPress = async () => {
        if (!isLoaded) return;

        await signUp.verifications.verifyEmailCode({ code })

        if (signUp.status === 'complete') {
            await signUp.finalize({
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask)
                        return
                    }

                    const url = decorateUrl('/')
                    router.replace(url as Href)
                },
            })
        } else {
            console.error('Sign-up attempt not complete:', signUp)
        }
    }

    if (isSignedIn) {
        router.replace('/')
        return null
    }

    return (
        <SafeAreaView style={styles.container}>
            {!showEmailCode ? (
                <>
                    <Pressable onPress={() => router.push("/")} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </Pressable>

                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to get started</Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>First Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John"
                            placeholderTextColor="#999"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        {errors.fields.firstName && (
                            <Text style={styles.errorText}>{errors.fields.firstName.message}</Text>
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Last Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Doe"
                            placeholderTextColor="#999"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                        {errors.fields.lastName && (
                            <Text style={styles.errorText}>{errors.fields.lastName.message}</Text>
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="user@example.com"
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={emailAddress}
                            onChangeText={setEmailAddress}
                        />
                        {errors.fields.emailAddress && (
                            <Text style={styles.errorText}>{errors.fields.emailAddress.message}</Text>
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="********"
                            placeholderTextColor="#999"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        {errors.fields.password && (
                            <Text style={styles.errorText}>{errors.fields.password.message}</Text>
                        )}
                    </View>

                    <Pressable
                        style={[
                            styles.primaryButton,
                            (fetchStatus === 'fetching' || !emailAddress || !password) && styles.buttonDisabled
                        ]}
                        onPress={onSignUpPress}
                        disabled={fetchStatus === 'fetching' || !emailAddress || !password}
                    >
                        {fetchStatus === 'fetching' ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Continue</Text>
                        )}
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/sign-in">
                            <Text style={styles.linkText}>Login</Text>
                        </Link>
                    </View>

                    <View nativeID="clerk-captcha" />
                </>
            ) : (
                <>
                    <View style={styles.header}>
                        <Text style={styles.title}>Verify Email</Text>
                        <Text style={styles.subtitle}>Enter the code sent to your email</Text>
                    </View>

                    <View style={styles.formGroup}>
                        <TextInput
                            style={[styles.input, styles.codeInput]}
                            placeholder="123456"
                            placeholderTextColor="#999"
                            keyboardType="number-pad"
                            value={code}
                            onChangeText={setCode}
                        />
                        {errors.fields.code && (
                            <Text style={styles.errorText}>{errors.fields.code.message}</Text>
                        )}
                    </View>

                    <Pressable
                        style={[styles.primaryButton, fetchStatus === 'fetching' && styles.buttonDisabled]}
                        onPress={onVerifyPress}
                        disabled={fetchStatus === 'fetching'}
                    >
                        {fetchStatus === 'fetching' ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Verify</Text>
                        )}
                    </Pressable>
                </>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 28,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 28,
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.primary,
        marginBottom: 8,
    },
    input: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        color: COLORS.primary,
    },
    codeInput: {
        textAlign: 'center',
        letterSpacing: 8,
    },
    primaryButton: {
        width: '100%',
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 999,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        color: '#666',
        fontSize: 16,
    },
    linkText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 14,
        marginTop: 4,
    },
})
