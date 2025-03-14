import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DEFAULT_AVATAR = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png";
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/";

interface UserDetailsDialogProps {
  user: {
    username: string;
    profilePicture?: string;
    bio?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getFullImageUrl = (profilePicture: string | undefined): string => {
  if (!profilePicture) return DEFAULT_AVATAR;
  if (profilePicture.startsWith('http')) return profilePicture;
  return CLOUDINARY_BASE_URL + profilePicture;
};

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">User Details</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="relative h-32 w-32 overflow-hidden rounded-full">
              <img
                src={getFullImageUrl(user.profilePicture)}
                alt={`${user.username}'s profile`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
            </div>
            <div className="space-y-3 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {user.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.bio || "No bio available!"}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}