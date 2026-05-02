import api from '@/services/api'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

export default function TestPage() {
    const [message, setMessage] = useState('')
    const test = async () => {

        const res = await api.get('/test')
        console.log(res.data.ok)
        setMessage(res.data.ok)
    }
    return (
        <View>
            <Text>HI GUYS</Text>
            <Pressable onPress={test}>
                <Text>click me and get the message</Text>
            </Pressable>

            <Text>{message}</Text>
        </View>


    )
}