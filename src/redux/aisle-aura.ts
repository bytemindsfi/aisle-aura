import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {ILoginUser, INewUser} from "@/types";
import supabase from "@/lib/supabase.ts";
import { Simulate } from "react-dom/test-utils";
import error = Simulate.error;

export const aisleAuraApi = createApi({
  reducerPath: "aisleAuraApi",
  tagTypes: ["user"],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => {
    return {
      register: builder.mutation({
        queryFn: async (newUser: INewUser) => {
          try {
            const { data: registeredUser, error: userRegError } =
              await supabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                  options:{
                    data: {firstName: newUser.firstName,
                        lastName: newUser.lastName,
                        agreeToTerms: newUser.agreeToTerms}
                  }
              });
            console.log("User registration", registeredUser);
            if (userRegError)
              throw new Error(userRegError.message);
            return { data: registeredUser };
          } catch (e) {
            return e.message;
          }
        },
        invalidatesTags: ["user"],
      }),
      login: builder.mutation({
          queryFn: async (user:ILoginUser ) => {
              try {
                  const { data, error } = await supabase.auth.signInWithPassword({
                      email: user.email,
                      password: user.password,
                  })
                  if (error) {
                      console.log('Login error', error);
                      throw new Error(
                          error.message,
                      );
                  }
                  return { data };
              } catch (e) {
                  return e.message;
              }
          },
        invalidatesTags: ["user"],
      }),
      logout: builder.mutation({
        queryFn: async () => {
          try {
              const { error } = await supabase.auth.signOut()
            if (error)
              throw new Error(
                  error.message,
              );
            console.log('Logout successful', error);
            localStorage.setItem("isAuthenticated", undefined);
            return { data: "OK" };
          } catch (e) {
            return e.message;
          }
        },
        invalidatesTags: ["user"],
      })
    };
  },
});

export const { useRegisterMutation, useLoginMutation, useLogoutMutation } = aisleAuraApi;

export const { endpoints, reducerPath, reducer, middleware } = aisleAuraApi;
