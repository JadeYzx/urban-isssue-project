"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface UserNavProps {
  user: {
    id: string;
    name: string;
    profileImage?: string;
  }
}

export function UserNav({ user }: UserNavProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      <Link 
        href={`/profile/${user.id}`}
        className="flex items-center gap-2 rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.profileImage || ""} alt={user.name} />
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:inline">{user.name}</span>
      </Link>
    </div>
  );
}