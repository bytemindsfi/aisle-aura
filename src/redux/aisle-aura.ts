import { createApi } from "@reduxjs/toolkit/query/react";
import { ILoginUser, INewUser, ListWithStats } from "@/types";
import supabase from "@/lib/supabase.ts";

export const supabaseBaseQuery = async ({
  table,
  method = "select",
  body,
  select = "*",
  filters = {},
  order,
}: any) => {
  try {
    let query = supabase.from(table)[method](select);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    // Apply ordering
    if (order) {
      order.forEach((o: any) => {
        query = query.order(o.column, { ascending: o.ascending });
      });
    }

    const { data, error } = await query;

    if (error) {
      return { error: { status: "CUSTOM_ERROR", error: error.message } };
    }

    return { data };
  } catch (e: any) {
    return { error: { status: "FETCH_ERROR", error: e.message } };
  }
};

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
    };
  },
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetListWithStatsQuery,
} = aisleAuraApi;

export const { endpoints, reducerPath, reducer, middleware } = aisleAuraApi;
