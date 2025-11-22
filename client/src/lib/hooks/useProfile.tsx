import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import agent from "../api/agent";


export const useProfile = (id?: string, predicate?: string) => {
  const [filter, setFilter] =useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loadingProfile } = useQuery<Profile>({
    queryKey: ['profile', id],
    queryFn: async () => {
      const response = await agent.get<Profile>(`/profile/${id}`);
      return response.data;
    },
    enabled: !!id && !predicate
  });

  const { data: photos, isLoading: loadingPhoto } = useQuery<Photo[]>({
    queryKey: ['photos', id],
    queryFn: async () => {
      const response = await agent.get<Photo[]>(`/profile/${id}/photos`);
      return response.data;
    },
    enabled: !!id && !predicate
  });

const { data: followings, isLoading: loadingFollowings } = useQuery<Profile[]>({
  queryKey: ['followings', id, predicate],
  queryFn: async () => {
    const response = await agent.get<Profile[]>(
      `/profile/${id}/follow-list?predicate=${predicate}`
    );
    return response.data;
  },
  enabled: !!id && !!predicate
});

const {data: userActivities, isLoading: loadingUserActivities} = useQuery({
  queryKey: ['user-activities', filter],
  queryFn: async () => {
    const response = await agent.get<Activity[]>(`/profile/${id}/activities`, {
      params: {
        filter
      }
    });
    return response.data
  },
  enabled: !!id && !!filter
})


  const upload = useMutation({
    mutationFn: async (file: Blob) => {
      const formData = new FormData();
      formData.append('file', file)
      const reponse = await agent.post('/profile/add-photo', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
      return reponse.data;
    },
    onSuccess: async (photo: Photo) => {
      await queryClient.invalidateQueries({
        queryKey:['photos', id]
      })
      queryClient.setQueryData(['user'], (data: User) => {
        if (!data) return data;
        return {
          ...data,
          imageUrl: data.imageUrl ?? photo.url
        }

      });
       queryClient.setQueryData(['profile', id], (data: Profile) => {
        if (!data) return data;
        return {
          ...data,
          imageUrl: data.imageUrl ?? photo.url
        }
        
      })
    }
  })

  const setMainPhoto = useMutation({
    mutationFn: async (photo: Photo) => {
      await agent.put(`/profile/${photo.id}/setMain`)
    },
    onSuccess: (_, photo) => {
      queryClient.setQueryData(['user'], (userData: User) => {
        if (!userData) return userData;
        return {
          ...userData,
          imageUrl: photo.url
        }
      });

      queryClient.setQueryData(['profile', id], (profileData: Profile) => {
        if (!profileData) return profileData;
        return {
          ...profileData,
          imageUrl: photo.url
        }
      });
    }
  })
const setProfile = useMutation({
    mutationFn: async (data: { displayName: string; bio?: string }) => {
      const response = await agent.put<Profile>('/profile', data); 
      return response.data;
    },
    onSuccess: (updatedProfile) => {
      
  
      queryClient.invalidateQueries({ queryKey: ['profile', id] });
     
      queryClient.setQueryData(['user'], (userData: User | undefined) => {
        if (!userData) return userData;
        return {
          ...userData,
          imageUrl: updatedProfile.imageUrl ?? userData.imageUrl,
          displayName: updatedProfile.displayName
        };
      });
    },
  });




  const deletePhoto = useMutation({
  mutationFn: async (photoId: string) => {
    await agent.delete(`/profile/${photoId}/photos`);
  },
  onSuccess: async (_, photoId) => {
    queryClient.setQueryData(['photos', id], (photos: Photo[] | undefined) =>
      photos ? photos.filter(x => x.id !== photoId) : []
    );
    await queryClient.invalidateQueries({ queryKey: ['photos', id] });
  },
  });

  const updateFollowing = useMutation({
    mutationFn: async () => {
      await agent.post(`/profile/${id}/follow`)
    },
    onSuccess: () => {
      queryClient.setQueryData(['profile', id], (profile: Profile) => {
        queryClient.invalidateQueries({queryKey: ['followings', id, 'followers']})
        if (!profile || profile.followersCount === undefined) return profile;
        return {
          ...profile,
          following: !profile.following,
          followersCount: profile.following 
            ? profile.followersCount - 1 
            :  profile.followersCount + 1

        }
      })
    }
  })

  const isCurrentUser = useMemo(() => {
  const currentUser = queryClient.getQueryData<User>(['user']);
  return id === currentUser?.id;
    }, [id, queryClient]);

  
  
  return {
    profile,
    loadingProfile,
    userActivities,
    loadingUserActivities,
    photos,
    loadingPhoto,
    setFilter,
    isCurrentUser, 
    upload,
    setMainPhoto,
    deletePhoto,
    setProfile,
    updateFollowing,
    followings,
    loadingFollowings
  };
};
