import { createApi } from "@reduxjs/toolkit/query/react";
import {ILoginUser, INewUser, ListWithStats, NewListInput} from "@/types";
import supabase from "@/lib/supabase.ts";

const supabaseBaseQuery = async ({
                                            table,
                                            method = 'select',
                                            select = '*',
                                            body,  // For insert/update operations
                                            filters = {},
                                            order,
                                            single = false  // For .single()
                                        }: any) => {
    try {
        let query: any;

        // Handle different methods
        if (method === 'insert') {
            query = supabase.from(table).insert(body).select(select)
        } else if (method === 'update') {
            query = supabase.from(table).update(body).select(select)
            // Apply filters for update
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value)
            })
        } else if (method === 'delete') {
            query = supabase.from(table).delete()
            // Apply filters for delete
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value)
            })
        } else {
            // SELECT
            query = supabase.from(table).select(select)
            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value)
            })
        }

        // Apply ordering (only for select)
        if (method === 'select' && order) {
            order.forEach((o: any) => {
                query = query.order(o.column, { ascending: o.ascending })
            })
        }

        // Apply single if needed
        if (single) {
            query = query.single()
        }

        const { data, error } = await query

        if (error) {
            return { error: { status: 'CUSTOM_ERROR', error: error.message } }
        }

        return { data }
    } catch (e: any) {
        return { error: { status: 'FETCH_ERROR', error: e.message } }
    }
}

export const aisleAuraApi = createApi({
  reducerPath: "aisleAuraApi",
  tagTypes: ["user", "list"],
  baseQuery: supabaseBaseQuery,
  endpoints: (builder) => {
    return {
      register: builder.mutation({
        queryFn: async (newUser: INewUser) => {
          try {
            const { data: registeredUser, error: userRegError } =
              await supabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                  data: {
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    agreeToTerms: newUser.agreeToTerms,
                  },
                },
              });
            console.log("User registration", registeredUser);
            if (userRegError) throw new Error(userRegError.message);
            return { data: registeredUser };
          } catch (e) {
            return e.message;
          }
        },
        invalidatesTags: ["user"],
      }),
      login: builder.mutation({
        queryFn: async (user: ILoginUser) => {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: user.email,
              password: user.password,
            });
            if (error) {
              console.log("Login error", error);
              throw new Error(error.message);
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
            const { error } = await supabase.auth.signOut();
            if (error) throw new Error(error.message);
            localStorage.setItem("isAuthenticated", undefined);
            return { data: "OK" };
          } catch (e) {
            return e.message;
          }
        },
        invalidatesTags: ["user"],
      }),
      getListWithStats: builder.query<ListWithStats[], void>({
        queryFn: async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session?.user) {
            return {
              error: { status: "CUSTOM_ERROR", error: "Not authenticated" },
            };
          }

          return supabaseBaseQuery({
            table: "lists_with_stats",
            filters: { user_id: session.user.id },
            order: [
              { column: "is_pinned", ascending: false },
              { column: "updated_at", ascending: false },
            ],
          });
        },
        providesTags: ["list"],
      }),
        addNewList: builder.mutation<any, NewListInput>({
            queryFn: async (newList) => {
                // Get current user session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    return { error: { status: 'AUTH_ERROR', error: sessionError.message } }
                }

                if (!session?.user) {
                    return { error: { status: 'AUTH_ERROR', error: 'Not authenticated' } }
                }

                // Step 1: Insert the new list
                const listResult = await supabaseBaseQuery({
                    table: 'lists',
                    method: 'insert',
                    body: {
                        user_id: session.user.id,
                        name: newList.name,
                        is_pinned: newList.is_pinned ?? false,
                        is_shared: newList.is_shared ?? false,
                        status: 'active'
                    },
                    single: true
                })

                if (listResult.error) {
                    return listResult  // Return error if list creation failed
                }

                const createdList = listResult.data

                // Step 2: If items provided, insert them
                if (newList.items && newList.items.length > 0) {
                    const itemsToInsert = newList.items.map((item) => ({
                        list_id: createdList.id,
                        ...item
                    }))

                    const itemsResult = await supabaseBaseQuery({
                        table: 'list_items',
                        method: 'insert',
                        body: itemsToInsert
                    })

                    if (itemsResult.error) {
                        // Items failed to insert, but list was created
                        // You might want to delete the list here or return partial success
                        return {
                            error: {
                                status: 'PARTIAL_ERROR',
                                error: `List created but items failed: ${itemsResult.error.error}`
                            }
                        }
                    }
                }

                // Return the created list
                return { data: createdList }
            },
            invalidatesTags: ['list']
        })
    };
  },
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetListWithStatsQuery,
    useAddNewListMutation
} = aisleAuraApi;

export const { endpoints, reducerPath, reducer, middleware } = aisleAuraApi;
