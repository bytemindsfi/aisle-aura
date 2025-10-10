import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import {INewUser} from "@/types";
import supabase from "@/lib/supabase.ts";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

export const aisleAuraApi = createApi({
    reducerPath: 'aisleAuraApi',
    tagTypes: ['user'],
    baseQuery: fakeBaseQuery(),
    endpoints: (builder) => {
        return {
            register: builder.mutation({
                queryFn: async (newUser: INewUser) => {
                    try {
                        const {data: registeredUser, error:userRegError} = await supabase.auth.signUp({email: newUser.email, password: newUser.password});
                        delete newUser.password;
                        const {data: dbUser, error:userDbInsertError} = await supabase.from('users').insert({...newUser, id: registeredUser.user.id }).select('id').single();
                        console.log("User registration", registeredUser, dbUser);
                        if (userRegError || userDbInsertError) throw error(userRegError ? userRegError.message : userDbInsertError.message);
                        return {data: registeredUser}
                    }catch (e) {
                        return e.message
                    }
                },
                invalidatesTags: ['user'],
            }),
            login: builder.mutation({
                query: () => ({
                    url: `reviews/`,
                    method: 'PUT',
                    body: { },
                }),
                transformResponse: (response: { data: any }) => response.data,
                invalidatesTags: ['user'],
            })
        };
    },
});

export const {
    useRegisterMutation,useLoginMutation,
} = aisleAuraApi;

export const { endpoints, reducerPath, reducer, middleware } = aisleAuraApi;
