import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import agent from "../api/agent";


export const useProfile = (id?: string) => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loadingProfile } = useQuery<Profile>({
    queryKey: ['profile', id],
    queryFn: async () => {
      const response = await agent.get<Profile>(`/profile/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: photos, isLoading: loadingPhoto } = useQuery<Photo[]>({
    queryKey: ['photos', id],
    queryFn: async () => {
      const response = await agent.get<Photo[]>(`/profile/${id}/photos`);
      return response.data;
    },
    enabled: !!id,
  });

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
  // const deletePhoto = useMutation({
  //   mutationFn: async (photoId: string) => {
  //     await agent.delete(`/profile/${photoId}/photos`)
  //   },
  //   onSuccess: (_, photoId) => {
  //     queryClient.setQueryData(['photos, id'],(photos: Photo[]) => {
  //       return photos?.filter(x => x.id !== photoId)
  //     })
    
  // }
  // })
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

  const isCurrentUser = useMemo(() => {
  const currentUser = queryClient.getQueryData<User>(['user']);
  return id === currentUser?.id;
    }, [id, queryClient]);

  
  
  return {
    profile,
    loadingProfile,
    photos,
    loadingPhoto,
    isCurrentUser, 
    upload,
    setMainPhoto,
    deletePhoto
  };
};
