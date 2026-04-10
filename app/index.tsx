import { RootState } from '@/redux/types'
import { Redirect } from 'expo-router'
import React from 'react'
import { useSelector } from 'react-redux'

const Root = () => {

    const { userData } = useSelector((state: RootState) => state.persistSlice)

    return (
        <Redirect href={userData ? "/chatList" : "/auth/login"} />
    )
}

export default Root